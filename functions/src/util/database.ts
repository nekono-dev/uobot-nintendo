import { postType } from '../type'
import { z } from 'zod'
import { initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

const adminApp = getDatabase(initializeApp())

export const getDiffFromDB = async (ref: string, input: postType[]) => {
    let diffResult: postType[] = []
    const dataCursor = adminApp.ref(ref)
    const parsedData = z
        .string()
        .array()
        .nullable()
        .safeParse(
            await dataCursor.once('value').then((snapshot) => snapshot.val())
        )
    if (parsedData.success !== true) {
        return
    }
    const verifiedData = parsedData.data
    if (verifiedData !== null) {
        diffResult = input.reduce<postType[]>((newArr, elem) => {
            const findResult: string | undefined = verifiedData.find(
                (value) => elem.url === value
            )
            if (findResult === undefined) {
                newArr.push(elem)
                return newArr
            }
            return newArr
        }, [])
    } else {
        diffResult = input
    }
    await writeData(
        ref,
        input.map((v) => v.url)
    )
    return diffResult
}
const writeData = async (ref: string, data: string[]) => {
    const dataCursor = adminApp.ref(ref)
    await dataCursor.set(data)
}
