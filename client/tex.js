// Scrapbox記法の変換に必要不可欠なものはシステム側で定義しておく
const appTemplateHeadLines = `% [by pimento]
% 行内にアイコン画像を表示するための設定
% https://tex.stackexchange.com/questions/258299/embed-small-image-within-a-line-of-text
\\usepackage{calc}
\\newlength\\myheight
\\newlength\\mydepth
\\settototalheight\\myheight{Xygp}
\\settodepth\\mydepth{Xygp}
\\setlength\\fboxsep{0pt}
\\newcommand*\\scrapboxicon[1]{%
  \\settototalheight\\myheight{Xygp}%
  \\settodepth\\mydepth{Xygp}%
  \\raisebox{-\\mydepth}{\\includegraphics[height=\\myheight]{#1}}%
}`.split('\n')

module.exports = { appTemplateHeadLines }
