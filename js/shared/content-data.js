const ContentData = {
	about: {
  name: "Zhang Huangzhao",
  nameChinese: "张煌昭",
  photo: "img/me.jpg",
  bio: [
    "Hi! My name is <b>Zhang Huangzhao (张煌昭 in Chinese)</b>.",
    "I received my bachelor's degree in Computer Science from <b>Yuanpei College, Peking University (北京大学元培学院)</b>, and my PhD from the <b>School of Computer Science, Peking University (北京大学计算机学院)</b>.",
    "I served as a principal engineer at Huawei 2012 Lab from 2024 to 2025.",
    "Now I am working on building agentic systems for software engineering..."
  ],
  contact: {
    email: "zhang_hz@pku.edu.cn",
    wechat: "dr__lc",
    wechatNote: "Note that there are two underscores, and please <b>include your name in the friend request.</b>",
    github: {
      username: "LC-John",
      url: "https://github.com/LC-John"
    }
  }
},

	github: {
		profileImage: "img/github_progile.png",
		username: "LC-John",
		url: "https://github.com/LC-John",
		title: "My GitHub Profile",
		description: "Click the button below to visit my GitHub page"
	},

	works: {
		papers: [
			{
				authors: "Kechi Zhang, <b>Huangzhao Zhang</b>, Ge Li, Jinliang You, Jia Li, Yunfei Zhao, Zhi Jin",
				title: "SEAlign: Alignment training for software engineering agent",
				venue: "ICSE 2026 accepted",
				url: "https://arxiv.org/abs/2503.18455",
				pdfUrl: "pdf/sealign-icse2026.pdf"
			},
			{
				authors: "<b>Huangzhao Zhang</b>, Kechi Zhang, Zhuo Li, Jia Li, Jia Li, Yongmin Li, Yunfei Zhao, Fang Liu, Ge Li, Zhi Jin",
				title: "Deep Learning for Code Generation: A Survey",
				venue: "SCIS 2024",
				url: "https://link.springer.com/article/10.1007/s11432-023-3956-3",
				pdfUrl: "pdf/dl4cg-survey-scis2024.pdf"
			},
			{
				authors: "<b>Lichen Zhang</b>, Shuai Lu, Nan Duan",
				title: "Selene: Pioneering Automated Proof in Software Verification",
				venue: "ACL 2024",
				url: "https://arxiv.org/abs/2401.07663",
				pdfUrl: "pdf/selene-acl2024.pdf",
				note: "(Yes, Lichen is my alias.)"
			},
			{
				authors: "Kechi Zhang, Ge Li, <b>Huangzhao Zhang</b>, Zhi Jin",
				title: "Hirope: Length extrapolation for code models using hierarchical position",
				venue: "ACL 2024",
				url: "https://arxiv.org/abs/2403.19115",
				pdfUrl: "pdf/hirope-acl2024.pdf"
			},
			{
				authors: "<b>Huangzhao Zhang</b>, Zhuo Li, Jia Li, Zhi Jin, Ge Li",
				title: "WELL: Applying Bug Detectors to Bug Localization via Weakly Supervised Learning",
				venue: "JSEP 2024",
				url: "https://onlinelibrary.wiley.com/doi/full/10.1002/smr.2669",
				pdfUrl: "pdf/well-jsep2024.pdf"
			},
			{
				authors: "Jin Zhao, <b>Huangzhao Zhang</b>, Ming-Zhe Chong, Yue-Yi Zhang, Zi-Wen Zhang, Zong-Kun Zhang, Chao-Hai Du, Pu-Kun Liu",
				title: "Deep-Learning-Assisted Simultaneous Target Sensing and Super-Resolution Imaging",
				venue: "ACS AMI 2023",
				url: "https://pubs.acs.org/doi/10.1021/acsami.3c07812",
				pdfUrl: "pdf/dl-imaging-acs2023.pdf"
			},
			{
				authors: "<b>Huangzhao Zhang</b>, Shuai Lu, Zhuo Li, Zhi Jin, Lei Ma, Yang Liu, Ge Li",
				title: "CodeBERT-Attack: Adversarial Attack against Source CodeDeep Learning Model via Pre-trained Model",
				venue: "JSEP 2024",
				url: "https://onlinelibrary.wiley.com/doi/full/10.1002/smr.2571",
				pdfUrl: "pdf/codebert-attack-jsep2024.pdf"
			},
			{
				authors: "Jia Li, Zhuo Li, <b>Huangzhao Zhang</b>, Ge Li, Zhi Jin, Xing Hu, Xin Xia",
				title: "Poison Attack and Poison Detection on Deep Source Code Processing Models",
				venue: "ACM TOSEM 2023",
				url: "https://dl.acm.org/doi/10.1145/3630008",
				pdfUrl: "pdf/poison-attack-tosem2023.pdf"
			},
			{
				authors: "Kechi Zhang, Wenhan Wang, <b>Huangzhao Zhang</b>, Ge Li, Zhi Jin",
				title: "Learning to Represent Programs with Heterogeneous Graphs",
				venue: "ICPC 2022",
				url: "https://arxiv.org/pdf/2012.04188.pdf",
				pdfUrl: "pdf/heterogeneous-graphs-icpc2022.pdf"
			},
			{
				authors: "<b>Huangzhao Zhang</b>, Zhiyi Fu, Ge Li, Lei Ma, Zhehao Zhao, HuaAn Yang, Yizhe Sun, Yang Liu, Zhi Jin",
				title: "Towards Robustness of Deep Program Processing Models -- Detection, Estimation and Enhancement",
				venue: "ACM TOSEM 2022, 31(3): 1-40",
				url: "https://dl.acm.org/doi/abs/10.1145/3511887",
				pdfUrl: "pdf/robustness-tosem2022.pdf"
			},
			{
				authors: "<b>Huangzhao Zhang</b>, Zhuo Li, Ge Li, Lei Ma, Yang Liu, Zhi Jin",
				title: "Generating Adversarial Examples for Holding Robustness of Source Code Processing Models",
				venue: "AAAI 2020: 1169-1176",
				url: "https://ojs.aaai.org//index.php/AAAI/article/view/5469",
				pdfUrl: "pdf/adversarial-examples-aaai2020.pdf"
			},
			{
				authors: "<b>Huangzhao Zhang</b>, Hao Zhou, Ning Miao, Lei Li",
				title: "Generating Fluent Adversarial Examples for Natural Languages",
				venue: "ACL (1) 2019: 5564-5569",
				url: "https://arxiv.org/pdf/2007.06174.pdf",
				pdfUrl: "pdf/fluent-adversarial-acl2019.pdf"
			}
		],
		projects: [
			{
				name: "DBChat",
				description: "A simple Browser/Server chat platform with MySQL backend",
				url: "https://github.com/LC-John/DBChat"
			},
			{
				name: "MiniC-Compiler",
				description: "A compiler to compile a subset of C language into RISCV instructions",
				url: "https://github.com/LC-John/MiniC-Compiler"
			},
			{
				name: "RISCV-Simulator",
				description: "A simulator for a subset instructions of RISCV instructions",
				url: "https://github.com/LC-John/RISCV-Simulator"
			},
			{
				name: "NACHOS",
				description: "An implementation of \"Not Another Completely Heuristic Operating System\"",
				url: "https://github.com/LC-John/Nachos"
			},
			{
				name: "AQI-CNN",
				description: "A CNN model to predict the AQI level",
				url: "https://github.com/LC-John/AQI-CNN"
			}
		]
	}
};

if (typeof window !== 'undefined') {
	window.ContentData = ContentData;
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = ContentData;
}
