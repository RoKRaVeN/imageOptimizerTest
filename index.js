const fs = require('fs')
const sharp = require('sharp')
const path = require('path')

exports.handler = async function (event) {

	const { optimoleKey } = event
	const width = 500
	const heigth = 500
	const quality = 90
	// optimoleKey string decodification
	const pass = new Buffer.from(optimoleKey, 'base64').toString('utf8')

	// image optimization
	const folder = path.join(__dirname, "images/")
	const files = fs.readdirSync(folder).filter(isImage)
	const optimized = await Promise.all(
		files.map(async file => {
			return new Promise((res, rej) => {
				try {
					const imagePath = path.join(__dirname, `images/${file}`)
					file = file.split(".")
					let extension = file.pop()
					if (["svg", "gif"].indexOf(extension) !== -1) extension = 'png'
					file.push(extension)
					let image = sharp(imagePath)
					image
						.resize({
							width,
							heigth,
							fit: sharp.fit.inside
						})
						.flatten({ background: { r: 255, g: 255, b: 255 } })
						.jpeg({ quality })
						.toFile(path.join(__dirname, `optimized/${file.join('.')}`))
						.then( () => {
							res({
								procent: quality,
								filePath: `optimized/${file.join('.')}`
							})
						})
				}
				catch (error) {
					rej(error)
				}
			})
		}))

	// return
	return {
		pass,
		optimized
	}
}


function isImage(element) {
	const extName = path.extname(element)
	return ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'].indexOf(extName) !== -1
}