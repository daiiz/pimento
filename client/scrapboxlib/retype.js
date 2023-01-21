const retypeAbsLinksToGyazoTeamsImages = (lines) => {
  const gyazoTeamsUrlPattern = /^https?:\/\/([a-zA-Z0-9]+)\.gyazo\.com\/([a-f0-9]{32})/
  for (const line of lines) {
    if (!line.nodes || line.nodes.length !== 1) continue
    const node = line.nodes[0]
    if (node.type !== 'link' || node.pathType !== 'absolute') continue
    if (!gyazoTeamsUrlPattern.test(node.href)) continue
    const [, teamName, imageId] = node.href.match(gyazoTeamsUrlPattern)
    if (teamName && imageId) {
      const srcUrl = `https://t.gyazo.com/teams/${teamName}/${imageId}`
      // Retype to "image"
      node.type = 'image'
      node.originalType = 'link'
      node.src = srcUrl
      node.link = '' // XXX: リンク先を持っている可能性はあるのであとで再検討
      delete node.content
      delete node.pathType
      delete node.href
    }
  }
}

const retypeStrongImagesToImages = (lines) => {
  for (const line of lines) {
    if (!line.nodes || line.nodes.length !== 1) continue
    const node = line.nodes[0]
    if (node.type !== 'strongImage') continue
    // Retype to "image"
    node.type = 'image'
    node.originalType = 'strongImage'
  }
}

module.exports = {
  retypeAbsLinksToGyazoTeamsImages,
  retypeStrongImagesToImages
}
