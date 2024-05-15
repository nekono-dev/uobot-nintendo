/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as functions from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params'

import { getInput } from './example/rss'
import { getDiffFromDB } from './util/database'
import { postBsky } from './post'
import { z } from 'zod'
// import * as logger from 'firebase-functions/logger'

// main
const botFunction = async () => {
    const referenceUrl = process.env.REFERENCE_URL
    const userHandle = process.env.BLUESKY_HANDLE
    if (referenceUrl === undefined || userHandle === undefined) {
        return
    }
    const infoArrivals = await getInput(referenceUrl)
    // logger.info(infoArrivals, { structuredData: true })
    const ref = new URL(referenceUrl).hostname.replace(
        RegExp('[.$\\[\\]#]', 'g'),
        '_'
    )
    const arrivals = infoArrivals
    const diffResult = await getDiffFromDB(ref, arrivals)
    // logger.debug(diffResult, { structuredData: true })

    if (diffResult === undefined || diffResult.length <= 0) {
        return true
    }
    await postBsky(
        { identifier: userHandle, password: appPasswd.value() },
        diffResult.reverse()
    )
    return true
}

const appPasswd = defineSecret('BLUESKY_PASSWD')
const apiToken = defineSecret('API_TOKEN')

export const bskyCollectBot = functions.https.onRequest(
    { region: 'asia-northeast1', secrets: [appPasswd, apiToken] },
    async (request, response) => {
        try {
            if (
                request.method !== 'POST' ||
                request.header('content-type')?.toLowerCase() !==
                    'application/json'
            ) {
                response.send('invalidmethod')
                response.end()
                return
            }
            const body = z.object({ token: z.string() }).safeParse(request.body)
            const token = apiToken.value()
            if (token === undefined) {
                response.send('tokenless')
                response.end()
                return
            }
            if (!body.success || body.data.token !== token) {
                response.send('unauthorized')
                response.end()
                return
            }
        } catch {
            response.send('unexpectederror')
            response.end()
            return
        }

        const result = await botFunction()
        if (result === undefined) {
            response.send('failed')
        } else {
            response.send('ok')
        }
        response.end()
    }
)
