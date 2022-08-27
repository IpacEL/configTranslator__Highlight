//全局变量
let $c = {},
	$dataAll = [],
	$dataLength = 0,

	$KeywordAll = {},
	$KeywordLength = 0
;



// Main
onmessage = function($tp){
	//开始
	postMessage(['m', '初始化 Worker...']);

	//运行主程序
	Main($tp);
};



function Main($tp){

	readyConfig();
	

	//初始化配置
	function readyConfig(){
		postMessage(['m', `初始化配置...`]);

		$c = $tp.data['Config'];

		//输出日志
		if($c.outLog === true){
			postMessage(['m', `初始化配置: ${JSON.stringify($c)}`]);
		}

		readyKeyword();
	};


	//初始化关键词
	function readyKeyword(){
		//初始化关键词
		if($c.Keyword.length !== 0){

			//启用关键词功能
			$c.Function.push('Keyword');

			//判断异步程序是否结束
			let $forNum = 0;

			//配置
			let $KeywordPathArray = $c.Keyword;
			//遍历数组
			for(let key in $KeywordPathArray){
				let $1keyword = $KeywordPathArray[key];

				postMessage(['m', `初始化关键词: ${$1keyword}....`]);

				//AJAX
				let $xhr = new XMLHttpRequest();
				$xhr.open('get', `../Keyword/${$1keyword}`, true);
				$xhr.send(null);
				$xhr.onloadend = function(){
					let $tp = $xhr.responseText;
					if($tp === '') return;

					$tp = JSON.parse($tp);

					//判断是否为json对象
					if(typeof $tp !== 'object') return;

					//合并json
					Object.assign($KeywordAll, $tp);

					//记录文件中有多少词
					let $1KeywordLength = Object.keys($tp).length;
					$KeywordLength = $KeywordLength + $1KeywordLength;

					//输出日志
					if($c.outLog === true){
						postMessage(['m', `初始化关键词: [${$forNum + 1}/${$KeywordPathArray.length}]: ${$1keyword} 完成!  ${(JSON.stringify($tp).length / 1024).toFixed(1)}KB`]);
					}else{
						postMessage(['m', `初始化关键词: ${$1keyword} 完成!`]);
					}

					//判断异步程序是否结束
					ifOK();
				}


				//判断异步程序是否结束
				function ifOK(){
					$forNum++;
					if($forNum >= $KeywordPathArray.length){
						readyData();
					}
				}
			} /// FOR ///
		}else{
			readyData();
		}
	};


	//将多行文本转换为数组
	function readyData(){
		postMessage(['m', `初始化字符串...`]);

		$dataAll = $tp.data['Data'].split("\n");
		$dataLength = $dataAll.length;

		postMessage(['m', `初始化字符串: 完成!  Length: ${$dataLength}`]);

		//开始运行
		From_pErfo();
	};
};



//解析数据
function parseFormat($Format, $data){
	let $i = [];

	// return ["类型", "键", "值", "缩进和注释符", "注释内容"];

	if($Format === 'CONFIG_YAML'){ // YAML 格式

		try{

			//注释
			if($i = (/^(\s*[\#]\s*?)([^ ].*)?$/g).exec($data)){
				return ["ok", "", "", $i[1], $i[2]];
			}
	
			//键值对 + 注释
			if($i = (/^(\s*.*[\:][\s*]{1})(.*[^ ])([\s*]{1,}[\#][\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], $i[3], $i[4]];
			}
	
			//键 + 注释
			if($i = (/^(\s*.*[\:])(\s*[\#][\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], "", $i[2], $i[3]];
			}
	
			//键值对
			if($i = (/^(\s*.*[\:][\s*]{1})(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], "", ""];
			}
	
			//键
			if($i = (/^(\s*.*[\:]\s*)$/g).exec($data)){
				return ["ok", $i[1], "", "", ""];
			}
	
			//数组 + 注释
			if($i = (/^(\s*[\-]\s*)(.*[^ ])(\s*[\#][\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], $i[3], $i[4]];
			}
	
			//数组
			if($i = (/^(\s*[\-]\s*)(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], "", ""];
			}
	
			//未匹配
			return ["no", $data];
	
		}catch (e){
			//正则出错
			return ["err", $data];
		}

	}else if($Format === 'CONFIG_JSON'){ // JSON 格式

		try{

			//括号 + 注释
			if($i = (/^(\s*[\{\[\}\]])(\s*[\/]{2}[\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], "", $i[2], $i[3]];
			}
	
			//括号
			if($i = (/^(\s*[\{\[\}\]]\s*)$/g).exec($data)){
				return ["ok", $i[1], "", "", ""];
			}
	
			//注释
			if($i = (/^(\s*[\/]{2}\s*?)([^ ].*)?$/g).exec($data)){
				return ["ok", "", "", $i[1], $i[2]];
			}
	
			//键值对 + 注释
			if($i = (/^(\s*[\"].*[\"][\:][\s*]{1})(.*[^ ])(\s*[\/]{2}[\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], $i[3], $i[4]];
			}
	
			//键 + 注释
			if($i = (/^(\s*[\"].*[\"][\:])(\s*[\/]{2}[\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], "", $i[2], $i[3]];
			}
	
			//键值对
			if($i = (/^^(\s*[\"].*[\"][\:][\s*]{1})(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], "", ""];
			}
	
			//键
			if($i = (/^(\s*[\"].*[\"][\:]\s*)$/g).exec($data)){
				return ["ok", $i[1], "", "", ""];
			}
	
			//数组 + 注释
			if($i = (/^(\s*[\"].*[\"][\,]?)(\s*[\/]{2}[\s*]?)(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], $i[3], $i[4]];
			}
	
			//数组
			if($i = (/^(\s*[\"].*[\"][\,]?[\s*]?)$/g).exec($data)){
				return ["ok", $i[1], $i[2], "", ""];
			}
	
			//未匹配
			return ["no", $data];
	
		}catch (e){
			//正则出错
			return ["err", $data];
		}

	}else if($Format === 'CONFIG_INI'){ // INI 格式

		try{
	
			//注释
			if($i = (/^(\s*[\#\;]\s*?)([^ ].*)?$/g).exec($data)){
				return ["ok", "", "", $i[1], $i[2]];
			}

			//标题 + 注释
			if($i = (/^(\s*\[)(.*)(\])(\s*[\#]\s*?)([^ ].*)$/g).exec($data)){
				return ["ok", $i[1] + $i[2] + $i[3], "", $i[4], $i[5]];
			}

			//标题
			if($i = (/^(\s*\[)(.*)(\]\s*)$/g).exec($data)){
				return ["ok", "", "", $i[1] + $i[2] + $i[3], ""];
			}

			//键值对 + 注释
			if($i = (/^(\s*.*[=][\s*]{0,})(.*[^ ])([\s*]{1}[\#]\s*?)([^ ].*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], $i[3], $i[4]];
			}
	
			//键值对
			if($i = (/^(\s*.*[=][\s*]{0,})(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[2], "", ""];
			}
	
			//键
			if($i = (/^(\s*.*[=][\s*]{0,})$/g).exec($data)){
				return ["ok", $i[1], "", "", ""];
			}
	
			//未匹配
			return ["no", $data];
	
		}catch (e){
			//正则出错
			return ["err", $data];
		}

	}else if($Format === 'LOG_MC1.8+'){ // LOG_MC1.8+ 格式

		try{
	
			//匹配INFO
			// /^(\[\d{2}\:\d{2}\:\d{2}\]\s*)(\[.*\/(INFO|WARN|ERROR)\]\:\s*)((?:\[.*\]:?\s*)?(?:\(.*(?:[^\(]\)\s*)|.*\:)?)?(.*)$/g
			if($i = (/^(\[\d{2}\:\d{2}\:\d{2}\]\s*)(\[.*\/(INFO|WARN|ERROR)\]\:\s*)((?:\[.*\]:?\s*)?(?:\(.*[^\(]\)\s*)?)?(.*)$/g).exec($data)){
				return ["ok", $i[1], $i[3], $i[2], $i[4] || "", $i[5]];
			}
	
			//未匹配
			return ["no", $data];
	
		}catch (e){
			//正则出错
			return ["err", $data];
		}

	}else if($Format === 'MCC_mcfunction'){ // mcfunction JSON 指令

		try{

			//匹配指令和JSON
			if($i = (/^(.*\s(?=\{))(\{\"(?:.+)\":(?:[\s\S]+)\})$/g).exec($data)){
				return ["ok", $i[1], $i[2]];
			}

			//未匹配
			return ["no", $data];
	
		}catch (e){
			//正则出错
			return ["err", $data];
		}

	}

};



//功能
function toolAb($mode, $data){
	
	//标准化译名
	if($mode === 'Keyword'){
		//替换(遍历关键词数组)到(对应的翻译)
		for(let key in $KeywordAll){
			// (?<=\\s)(${key})(?=\\s)|(${key})(?<=\\s)|^(${key})$
			// (?<=\s|^)(${key})(?=\s|$|\.|\,)
			//注意这里需要转义\\
			$data = $data.replace(new RegExp(`(?<=\\s|^)(${key})(?=\\s|$|\\.|\\,)`, 'gi'), $KeywordAll[key]);
		}

		return $data;


	//保留引号
	}else if($mode === '保留引号'){
		// return ["状态", 前引号, 内容, 后引号]
		if($a = (/^(\s*[\"\'\[\{}]{1,})(.*[^\"\'\]\}])([\"\'\]\}]{1,}[\,]?\s*)$/g).exec($data)){
			return ["ok", $a[1], $a[2], $a[3]];
		}else{
			return ["no"];
		}


	//保留符号
	}else if($mode === 'protectSign'){
		/*
		// /(?<=[>])([^<].*[^>])(?=[<])/g
		$data = $data.replace((/([\`\~\!\@\#\$\%\^\*\(\)\_\+\-\=\{\}\[\]\"\'\,\?\,\.\/]{1,})/g), function($i){
			return `<span class="-a3" translate="no">` + $i + `</span>`;
		});
		*/
		return $data;


	//保留中文
	}else if($mode === 'protectChinese'){
		$data = $data.replace((/[\u4e00-\u9fa5]{1,}/g), function($i){
			return `<span class="-a3" translate="no">` + $i + `</span>`;
		});
		
		return $data;


	//保留URL
	}else if($mode === 'protectURL'){
		$data = $data.replace((/(https?:\/\/|[A-Za-z0-9]\:\/)(\w|\=|\?|\.|\/|\&|\-|\#)+/gi), function($i){
			return `<span class="-a3" translate="no">` + $i + `</span>`;
		});
		return $data;


	//保留变量{0}和键值对
	}else if($mode === 'protectVar'){
		//
		$data = $data.replace((/(\{[0-9]+\}|\%[a-zA-Z0-9\_\-]+\%)/g), function($i){
			return `<span class="-a3" translate="no">` + $i + `</span>`;
		});


		//判断是否为翻译值模式
		if($c.Function.includes('valueAsNotes') === false){
			//保留键值对
			$data = $data.replace((/([a-zA-Z1-9\-\_]+\:{1}\s{1}(\"[\S\s]+\"|[a-zA-z0-9\-\_]+))/g), function($i){
				return `<span class="-a3" translate="no">` + $i + `</span>`;
			});
		}
		
		return $data;


	//匹配JSON中的所有值
	}else if($mode === '匹配JSON中的所有值'){
		//
		$data = $data.replace((/(?<=\:\s?\")(\\.|[^\\"])*(?=\")/g), function($i){
			//保留 /n
			$i = $i.replace((/(\\n)/g), function($i){
				return `<span class="-a3" translate="no">` + $i + `</span>`;
			});
			//标准化译名
			if($c.Function.includes('Keyword')) $i = toolAb('Keyword', $i);

			return `<span class="-notes-str" translate="yes">` + $i + `</span>`;
		});
		
		return $data;


	//尝试保留不需要翻译的部分
	}else if($mode === 'protectNotTranslation'){
		//
		$data = $data.replace((/(\<span class\=\"\-notes\-str\" translate\=\"yes\"\>)(\/[a-zA-Z]+[\s\S]+)(\<\/span\>)/g), function($i){
			//保留指令 /kill xxx
			if($i2 = (/^(\<span class\=\"\-notes\-str\" translate\=\"yes\"\>)(\/[a-zA-Z]+[\s\S]+)(\<\/span\>)$/g).exec($i)){
				$i = $i2[2];
			}
			return `<span class="-a3" translate="no">` + $i + `</span>`;
		});


		//保留 "color":", "action":""
		$data = $data.replace((/(\"(?:color|action)\"\:\s?\")(?:\<span class\=\"\-notes\-str\" translate\=\"yes\"\>)([a-zA-Z\_]+)(?:\<\/span\>)/g), function($i){
			if($i2 = (/(\"(?:color|action)\"\:\s?\")(?:\<span class\=\"\-notes\-str\" translate\=\"yes\"\>)([a-zA-Z\_]+)(?:\<\/span\>)/g).exec($i)){
				$i = $i2[1] + $i2[2];
			}
			return $i;
		});

		return $data;


	// 保留颜色代码
	}else if($mode === 'protectColorStr'){
		//
		$data = $data.replace((/(\§[0-9a-z]{1})/gi), function($i){
			return `<span class="-a3" translate="no">` + $i + `</span>`;
		});

		return $data;


	}
};



//处理空格
function space($data){
	return $data
		.replaceAll('  ', '&nbsp;&nbsp;')
		.replaceAll('	', '&nbsp;&nbsp;&nbsp;&nbsp;')
	;
};

//处理html标签
function escape($data){
	return $data
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
	;
};




/**
 * 开始
 */

function From_pErfo(){

	//变量
	let $num = 0,		//计数器
		$iM = '',		//单行数据
		$iMAll = '',	//缓存多行数据

		$FormatAll = $c.Format.substr(0, $c.Format.indexOf('_'))	//格式前缀
	;

	//遍历数组
	for(let key in $dataAll){
		let $data = $dataAll[key];
		//初始化
		$iM = '';
		

		//判断是否为空行
		if((/^(\s*)$/g).test($data)){
			$iM += `<span class="-1" translate="no">` + $data + `</span>`;
		}else{
			//获取配置和注释
			let $i = parseFormat($c.Format, $data);


			//格式前缀
			if($FormatAll === 'LOG'){

				//日志模式
				if($i[0] === "ok"){

					//写入时间
					if($i[1]){
						let $ii = escape($i[1]);
						$iM += `<span class="-TIME" translate="no">` + space($ii) + `</span>`;
					}

					//写入线程名/日志级别
					if($i[3]){
						let $ii = escape($i[3]);

						if($i[2] === 'INFO'){
							$iM += `<span class="-INFO" translate="no">` + space($ii) + `</span>`;
						}

						if($i[2] === 'WARN'){
							$iM += `<span class="-WARN" translate="no">` + space($ii) + `</span>`;
						}

						if($i[2] === 'ERROR'){
							$iM += `<span class="-ERROR" translate="no">` + space($ii) + `</span>`;
						}
					}

					//写入[模组名]? (模块名)?
					if($i[4]){
						let $ii = escape($i[4]);
						$iM += `<span class="-MOD" translate="no">` + space($ii) + `</span>`;
					}

					//写入日志内容
					if($i[5]){
						let $ii = escape($i[5]);

						//保留网址
						if($c.Function.includes('protectURL')) $ii = toolAb('protectURL', $ii);
						if($c.Function.includes('KeywordBypassChineseProtect')){
							//保留中文
							if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
							//标准化译名
							if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
						}else{
							//标准化译名
							if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
							//保留中文
							if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
						}
						//保留颜色代码
						if($c.Function.includes('protectColorStr')) $ii = toolAb('protectColorStr', $ii);
						//保留变量
						if($c.Function.includes('protectVar')) $ii = toolAb('protectVar', $ii);
						
						$iM += `<span class="-str" translate="yes">` + space($ii) + `</span>`;
					}

				}


			// 日志格式
			}else if($FormatAll === 'CONFIG'){

				//配置模式
				if($i[0] === "ok"){

					//写入键
					if($i[1]){
						let $ii = escape($i[1]);
						$iM += `<span class="-key" translate="no">` + space($ii) + `</span>`;
					}

					//写入值
					if($i[2]){
						let $ii = escape($i[2]);

						//将值作为注释
						if($c.Function.includes('valueAsNotes')){

							//保留网址
							if($c.Function.includes('protectURL')) $ii = toolAb('protectURL', $ii);
							if($c.Function.includes('KeywordBypassChineseProtect')){
								//保留中文
								if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
								//标准化译名
								if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
							}else{
								//标准化译名
								if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
								//保留中文
								if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
							}
							//保留颜色代码
							if($c.Function.includes('protectColorStr')) $ii = toolAb('protectColorStr', $ii);
							//保留变量
							if($c.Function.includes('protectVar')) $ii = toolAb('protectVar', $ii);
							
							//匹配所有引号
							let $a = toolAb('保留引号', $ii);
							if($a[0] === 'ok'){
								$iM += 
									`<span class="-a3" translate="no" title="保留引号">${space($a[1])}</span>` +
									`<span class="-notes-str" translate="yes">${space($a[2])}</span>` +
									`<span class="-a3" translate="no" title="保留引号">${space($a[3])}</span>`
								;
							}else{
								$iM += `<span class="-notes-str" translate="yes">` + space($ii) + `</span>`;
							}
							
						
						//保留被注释的配置
						}else{
							$iM += `<span class="-str" translate="no">` + space($ii) + `</span>`;
						}
						
					}

					//写入缩进和注释符
					if($i[3]){
						let $ii = escape($i[3]);
						$iM += `<span class="-a3" translate="no">` + space($ii) + `</span>`;
					}

					//写入注释
					if($i[4]){
						let $ii = escape($i[4]);

						//保留网址
						if($c.Function.includes('protectURL')) $ii = toolAb('protectURL', $ii);
						if($c.Function.includes('KeywordBypassChineseProtect')){
							//保留中文
							if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
							//标准化译名
							if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
						}else{
							//标准化译名
							if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
							//保留中文
							if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
						}
						//保留颜色代码
						if($c.Function.includes('protectColorStr')) $ii = toolAb('protectColorStr', $ii);
						//保留变量
						if($c.Function.includes('protectVar')) $ii = toolAb('protectVar', $ii);

						//输出
						$iM += `<span class="-notes" translate="yes">` + space($ii) + `</span>`;
					}

				}


			// mcfunction JSON 格式
			}else if($FormatAll === 'MCC'){


				//配置模式
				if($i[0] === "ok"){

					//写入 指令和普通参数
					if($i[1]){
						let $ii = escape($i[1]);
						$iM += `<span class="-key" translate="no">` + space($ii) + `</span>`;
					}

					//写入 JSON
					if($i[2]){
						let $ii = escape($i[2]);
						//匹配所有值
						$ii = toolAb('匹配JSON中的所有值', $ii);

						//标准化译名
						if($c.Function.includes('Keyword')) $ii = toolAb('Keyword', $ii);
						//保留中文
						if($c.Function.includes('protectChinese')) $ii = toolAb('protectChinese', $ii);
						//尝试保留不需要翻译的部分
						if($c.Function.includes('protectNotTranslation')) $ii = toolAb('protectNotTranslation', $ii);

						$iM += `<span class="-MOD" translate="no">` + space($ii) + `</span>`;
					}

				}
			}


			//未匹配
			if($i[0] === "no"){
				//写入数据
				let $ii = escape($i[1]);
				$iM += `<span class="-n1" translate="no">` + space($ii) + `</span>`;


			//出错
			}else if($i[0] === "err"){
				//写入数据
				let $ii = escape($i[1]);
				$iM += `<span class="-ERROR" translate="no">` + space($ii) + `</span>`;
			}

		} /// 不是空行 ///


		//后处理

		
		//输出数据
		$iMAll += $iM + `<br />`;

		$num++;
		let $numString = String($num);

		//每处理100行发送一次数据
		if($numString.substring($numString.length - 2) === '00'){
			//向前端发送数据
			postMessage(['c', $iMAll]);

			$iMAll = ''; //清空缓存数据
		}

		//每处理10行发送一次进度
		if($numString.substring($numString.length - 1) === '0'){
			postMessage(['m', `${$num}/${$dataLength}`]);
		}

	} //// FOR END ////

	
	//发送最后一些数据和结尾
	if($iMAll !== ''){
		postMessage(['c', $iMAll]);
		postMessage(['m', `完成!  Line: ${$dataLength}, Keyworld: ${$KeywordLength}`]);
	}
};
