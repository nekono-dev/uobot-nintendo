import { BskyAgent, AppBskyEmbedExternal, RichText } from '@atproto/api'
import { postType } from './type'
import { getOgp } from './util/getMeta'
import { quantOgp } from './util/compress';

export const postBsky = async (
    { identifier, password }: { identifier: string; password: string },
    input: postType[],
) => {
    const service = 'https://bsky.social'
    const agent = new BskyAgent({ service })

    await agent.login({
        identifier: identifier,
        password: password,
    })

    const postSet = await Promise.all(
        input.map(async (elem) => {
            const meta = await getOgp(elem.url)
            const text = `${elem.title}\n\n任天堂URL: ${elem.url}`
            const verifiedMeta: { title: string; description: string } = {
                title: `${elem.title}`,
                description: '',
            }
            if (meta.title !== undefined) {
                verifiedMeta.title = meta.title
            }
            if (meta.description !== undefined) {
                verifiedMeta.description = meta.description
            }
            const blob =
                meta.image !== undefined
                    ? await fetch(meta.image).then((r) => r.blob())
                    : undefined
            const embed: {
                $type: 'app.bsky.embed.external'
                external: AppBskyEmbedExternal.External
            } = {
                $type: 'app.bsky.embed.external',
                external: {
                    title: verifiedMeta.title,
                    uri: elem.url,
                    description: verifiedMeta.description,
                },
            }
            if (blob !== undefined) {
                const resizedBlob = await quantOgp(await blob.arrayBuffer())
                const { data: uploadResult } = await agent.uploadBlob(
                    new Uint8Array(resizedBlob),
                    {
                        encoding: blob.type,
                    },
                )
                embed.external.thumb = uploadResult.blob
            }
            const rt = new RichText({
                text,
            })
            await rt.detectFacets(agent)
            return {
                embed,
                rt,
            }
        }),
    )

    for (let i = 0; i < postSet.length; i++) {
        const elem = postSet[i]
        await agent.post({
            text: elem.rt.text,
            facets: elem.rt.facets,
            embed: elem.embed,
        })
    }
}
