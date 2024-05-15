import * as cheerio from 'cheerio'

export const getOgp = async (url: string) => {
    // console.debug(`DEBUG: url=${url}`)
    const body = await fetch(new URL(url)).then((r) => r.text())
    const $ = cheerio.load(body)
    const result: {
        title?: string
        description?: string
        image?: string
    } = {}
    $('meta').each((_, elem) => {
        const property: string | undefined = $(elem).attr('property')
        const content: string | undefined = $(elem).attr('content')
        const value: string | undefined = $(elem).attr('value')
        if (
            typeof property !== 'undefined' &&
            property.toLowerCase() === 'og:title'
        ) {
            result.title = content || value
        }
        if (
            typeof property !== 'undefined' &&
            property.toLowerCase() === 'og:image'
        ) {
            result.image = content || value
        }
        if (
            typeof property !== 'undefined' &&
            property.toLowerCase() === 'og:description'
        ) {
            result.description = content || value
        }
    })
    return result
}
