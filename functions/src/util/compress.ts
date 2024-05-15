import * as sharp from 'sharp'

export const quantOgp = async (image: ArrayBuffer): Promise<Buffer> => {
    return sharp(image).png({ palette: true }).toBuffer()
}
