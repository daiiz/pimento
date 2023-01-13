// Scrapbox記法の変換に必要不可欠なものはシステム側で定義しておく
const appTemplateHeadLines = `% [by pimento] BEGIN
% ベーシックな設定
\\usepackage{hyperref}
\\usepackage[font=small]{caption}
\\usepackage[most]{tcolorbox}
\\usepackage{url}
\\usepackage{listings}
\\usepackage{bm}
\\usepackage{amsmath}

\\let\\maketitle\\relax
\\usepackage{mytitle}
\\usepackage{titlesec}
\\usepackage{luatexja-fontspec}

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
}

% コードブロック
\\lstset{
  backgroundcolor={\\color[gray]{.95}},
  basicstyle={\\small\\ttfamily},
  lineskip=0truemm,
}
\\lstdefinestyle{pimento-block}{
  breaklines=true
}
\\lstdefinestyle{pimento-inline}{
  aboveskip=-3truemm,
  breaklines=true
}

% 引用ブロック
\\definecolor{quote-gray}{gray}{0.9}
\\newenvironment{pimento-quote}{\\begin{quote}}{\\end{quote}}
\\tcolorboxenvironment{pimento-quote}{
  blanker,
  borderline west={0.1in}{0pt}{quote-gray}
}

% 図表
\\renewcommand{\\lstlistingname}{リスト}
\\renewcommand{\\figurename}{図}
\\renewcommand{\\baselinestretch}{0.95}

% ページの左右余白比の調整
\\setlength{\\marginparwidth}{0pt}
\\setlength{\\marginparsep}{0pt}
\\setlength{\\oddsidemargin}{0pt}
\\setlength{\\evensidemargin}{0pt}
\\setlength\\intextsep{2truemm}

% autorefの設定
\\def\\equationautorefname~#1\\null{式(#1)\\null}
\\def\\figureautorefname~#1\\null{図#1\\null}
\\def\\subfigureautorefname#1\\null{図#1\\null}
\\def\\tableautorefname~#1{表#1}
\\def\\lstlistingautorefname~#1{リスト#1}
\\def\\partautorefname#1\\null{第#1部\\null}
\\def\\chapterautorefname#1\\null{第#1章\\null}
\\def\\sectionautorefname#1\\null{#1節}
\\def\\subsectionautorefname~#1\\null{#1節}
\\def\\subsubsectionautorefname#1\\null{#1節}
\\def\\appendixautorefname#1\\null{付録#1\\null}

% [by pimento] END`.split('\n')

module.exports = { appTemplateHeadLines }
