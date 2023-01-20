const retypeAbsLinksToGyazoTeamsImages = (lines) => {
  const gTeamUrlPattern = /^https?:\/\/([a-zA-Z0-9]+)\.gyazo\.com\/([a-f0-9]{32})/
  for (const line of lines) {
    if (!line.nodes || line.nodes.length !== 1) continue
    const node = line.nodes[0]
    if (node.type !== 'link' || node.pathType !== 'absolute') continue
    if (!gTeamUrlPattern.test(node.href)) continue
    const [, teamName, imageId] = node.href.match(gTeamUrlPattern)
    if (teamName && imageId) {
      // Retype to "image"
      node.type = 'image'
      node.src = node.href // XXX: thumbsかrawにしたほうがいい？
      node.link = '' // XXX: リンク先を持っている可能性はあるのであとで再検討
      delete node.content
      delete node.pathType
      delete node.href
    }
  }
}

module.exports = {
  retypeAbsLinksToGyazoTeamsImages
}
