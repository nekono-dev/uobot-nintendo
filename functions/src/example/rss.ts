import { postType } from '../type'
import * as cheerio from 'cheerio'

export const getInput = async (url: string) => {
    const body = await fetch(new URL(url)).then((r) => r.text())
    const $ = cheerio.load(body, {
        xmlMode: true,
    })
    const feedResult: postType[] = []
    $('item').each((_, elem) => {
        // console.debug(elem)
        feedResult.push({
            title: $(elem).find('title').text().trim(),
            url: $(elem).find('link').text().trim(),
        })
    })
    // 10件に絞る
    return feedResult.splice(0,10)
}
