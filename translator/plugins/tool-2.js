//全局变量
let $c = {
	"outLog": false,
	"ignoreFunctionLimit": false,
};


//复用
function geb($i){return document.getElementById($i)};

//获取当前时间 (格式化)
function time(){return '[' + new Date(Date.parse(new Date())).toLocaleString(navigator.language || 'zh-CN') + ']'};

//输出当前状态消息
function outLog($i){
	if($c.outLog === true){
		geb('scheduleLog').value += time() + ' ' + $i + "\n";
	}else{
		geb('schedule').innerHTML = $i;
	}
};



//监听用户选中的 Format
geb('ConfigBox-Format').addEventListener('click', function(e){
	if(e.target.tagName !== "INPUT") return;

	renderConfig('Function');
});


//渲染配置按钮
renderConfig('Format');
renderConfig('Function');
function renderConfig($mode){

	//配置目录
	const $config = {
		"Format": [
			{"ID": "CONFIG_YAML", "Name": "YAML", "Checked": true, "Function": [
				"valueAsNotes",
				"protectURL",
				"protectVar",
			]},
			{"ID": "CONFIG_JSON", "Name": "JSON", "Function": [
				"valueAsNotes",
				"protectURL",
				"protectVar",
			]},
			{"ID": "CONFIG_INI", "Name": "INI |", "Function": [
				"valueAsNotes",
				"protectURL",
				"protectVar",
			]},
			{"ID": "LOG_MC1.8+", "Name": "[日志]MC1.8+ |", "Function": [
				"protectURL",
				"protectVar",
			]},
			{"ID": "MCC_mcfunction", "Name": "mcfunction", "Function": [
				"protectNotTranslation",
			]}
		],
		"Function": [
			{"ID": "valueAsNotes", "Name": "翻译值"},
			{"ID": "protectURL", "Name": "保留URL和路径", "Checked": true},
			{"ID": "protectVar", "Name": "保留变量", "Checked": true},
			{"ID": "protectAnnotatedConfig", "Name": "保留被注释的配置"},
			{"ID": "protectNotTranslation", "Name": "尝试保留不需要翻译的部分", "Checked": true},
		],
		"NFFunction": [
			//{"ID": "uesFile", "Name": "uesFile"},
			{"ID": "protectColorStr", "Name": "保留颜色代码", "Checked": true},
			{"ID": "KeywordBypassChineseProtect", "Name": "不保留关键词", "Checked": true},
			{"ID": "protectChinese", "Name": "保留中文", "Checked": true},
			{"ID": "uesTranslationAPI", "Name": "使用翻译API[未实装]"},
		],
		"Keyword": [
			{"ID": "MinecraftAdd", "Path": "MinecraftAdd.json?v=101", "Name": "常见关键词", "From": "ApliNi"},
			{"ID": "MinecraftStandardName", "Path": "MinecraftStandardName.json?v=100", "Name": "MC标准化译名", "From": "Minecraft Wiki"},
			{"ID": "MinecraftItem", "Path": "MinecraftItem.json?v=100", "Name": "MC物品ID[1.18.2]", "From": "MC客户端"},
			{"ID": "computerAdd", "Path": "computerAdd.json?v=100", "Name": "[测试] 计算机相关单词", "From": "网络 & ApliNi"},
		],
		"Debug": [
			{"ID": "outLog", "Name": "输出日志"},
			{"ID": "ignoreFunctionLimit", "Name": "显示隐藏功能"},
		]
	};


	//渲染语言配置目录
	if($mode === 'Format'){
		let $iM;

		//语言目录
		$iM = '';
		for(let key in $config["Format"]){
			const $c = $config["Format"][key];
			const $checked = ($c["Checked"])? 'checked' : '';
			$iM += 
				`<input type="radio" name="Format" id="${$c["ID"]}" ${$checked}>` +
				`<label for="${$c["ID"]}">${$c["Name"]}</label>`
			;
		}
		geb('ConfigBox-Format').innerHTML = $iM;

		//其他功能
		$iM = '';
		for(let key in $config["NFFunction"]){
			const $c = $config["NFFunction"][key];
			const $checked = ($c["Checked"])? 'checked' : '';
			$iM += 
				`<input type="checkbox" name="Function" id="${$c["ID"]}" ${$checked}>` + // name="Function"
				`<label for="${$c["ID"]}">${$c["Name"]}</label>`
			;
		}
		geb('ConfigBox-NotFormat-Function').innerHTML = $iM;

		//关键词目录
		$iM = '';
		for(let key in $config["Keyword"]){
			const $c = $config["Keyword"][key];
			const $checked = ($c["Checked"])? 'checked' : '';
			$iM += 
				`<input type="checkbox" name="Keyword" id="${$c["ID"]}" data-path="${$c["Path"]}" ${$checked}>` +
				`<label for="${$c["ID"]}"> ${$c["Name"]}. <span class="-notes"> 来源: ${$c["From"]}</span> <a class="-notes-str -MainFS" href="Keyword/${$c["Path"]}">[查看]</a></label>` +
				`<br />`
			;
		}
		geb('ConfigBox-Keyword').innerHTML = $iM;

		//调试模式
		$iM = '';
		for(let key in $config["Debug"]){
			const $c = $config["Debug"][key];
			const $checked = ($c["Checked"])? 'checked' : '';
			$iM += 
				`<input type="checkbox" name="Debug" id="${$c["ID"]}" ${$checked}>` +
				`<label for="${$c["ID"]}"> ${$c["Name"]}</label>` +
				`<br />`
			;
		}
		geb('ConfigBox-Debug').innerHTML = $iM;
	}


	//渲染功能配置目录
	if($mode === 'Function'){
		//是否始终显示所有功能 (debug)
		if($c.ignoreFunctionLimit === false){
			//获取当前选中的语言的功能数组
			let $Format = Array.from(document.getElementsByName('Format'));
			$Format = $Format.filter(item => {
				return item.checked === true;
			});
			$Format = $Format[0].id;

			let $FormatFunctionArray = $config["Format"].filter(item => {
				return item["ID"] === $Format;
			});
			$FormatFunctionArray = $FormatFunctionArray[0]["Function"];


			let $iM = '';
			for(let key in $FormatFunctionArray){
				let $c = $FormatFunctionArray[key];

				//获取FuncID的JSON
				let $FuncJSON = $config["Function"].filter(item => {
					return item["ID"] === $c;
				});
				$c = $FuncJSON[0];

				const $checked = ($c["Checked"])? 'checked' : '';
				
				$iM += 
					`<input type="checkbox" name="Function" id="${$c["ID"]}" ${$checked}>` +
					`<label for="${$c["ID"]}">${$c["Name"]}</label>`
				;
			}
		
			//输出
			geb('ConfigBox-Function').innerHTML = $iM;
		}else{
			let $iM = '';
			for(let key in $config["Function"]){
				const $c = $config["Function"][key];
				const $checked = ($c["Checked"])? 'checked' : '';
				$iM += 
					`<input type="checkbox" name="Function" id="${$c["ID"]}" ${$checked}>` +
					`<label for="${$c["ID"]}">${$c["Name"]}</label>`
				;
			}
			geb('ConfigBox-Function').innerHTML = $iM;
		}

	}
};



//CAKE.JS
function From_pErfo(){
	//初始化配置
	outLog('初始化 Config...');

	//清空输出盒子
	geb('Main').innerHTML = '';
	//清空日志盒子
	geb('scheduleLog').value = '';


	//开始
	var $w = new Worker('plugins/cake.js?v='+ $cake_version);
	

	//当前选中的语言
	let $Format = Array.from(document.getElementsByName('Format')).filter(item => {
		return item.checked === true;
	});
	$Format = $Format[0].id;

	//当前选中的配置
	let $FunctionArray = [];
	Array.from(document.getElementsByName('Function')).filter(item => {
		if(item.checked === true){
			$FunctionArray.push(item.id);
		}
	});

	//当前选中的关键词组
	let $Keyword = [];
	Array.from(document.getElementsByName('Keyword')).filter(item => {
		if(item.checked === true){
			$Keyword.push(item.dataset.path);
		}
	});

	//创建配置
	let $config = {
		"Config": {
			"Format": $Format,
			"Function": $FunctionArray,
			"Keyword": $Keyword,
			"outLog": $c.outLog,
		},
		"Data": geb('inpConfig').value,
	};


	//上传配置
	$w.postMessage($config);
	
	//监听输出
	$Main_Num = 0;
	$w.onmessage = function($tp){
		$tp = eval($tp.data);

		//输出进度
		if($tp[0] === 'm') outLog($tp[1]);
		//输出数据
		if($tp[0] === 'c'){
			$Main_Num++;

			geb('Main').innerHTML += `
				<div id="Main_${$Main_Num}">
					${$tp[1]}
				</div>
			`;
			
			//使用翻译API
			if($config.Config.Function.includes('uesTranslationAPI')){
				Func_uesTranslationAPI($Main_Num);
			}

		}
	}

};



//自动滚动
function down($h){
	//每次执行增加屏幕高度
	var $sh = document.documentElement.clientHeight
	if(!$h){var $h = $sh}else{var $h = $h + $sh}
	
	//滚动
	document.documentElement.scrollTop = $h;
	
	//循环和停止
	if($h < document.body.clientHeight){
		setTimeout(function(){down($h)}, 370);
	}else{
		setTimeout(function(){
			document.documentElement.scrollTop = 0;
		}, 320);
	}
};



//监听用户选中的 Debug
geb('ConfigBox-Debug').addEventListener('click', function(e){
	if(e.target.tagName !== "INPUT") return;
	let $id = e.target.id;

	if($id === 'outLog'){ //输出日志
		if(geb($id).checked === true){
			$c.outLog = true;
			geb('schedule').style.display = 'none';
			geb('scheduleLog').style.display = 'inline';
		}else{
			$c.outLog = false;
			geb('schedule').style.display = 'inline';
			geb('scheduleLog').style.display = 'none';
		}

	}else if($id === 'ignoreFunctionLimit'){ //始终显示所有功能
		$c.ignoreFunctionLimit = geb($id).checked;
		renderConfig('Function');
	}
});



//使用翻译API
function Func_uesTranslationAPI($id_Num){
	//获取所有需要翻译的标签
	let $spanAll = [];
	//获取所有需要翻译的字符串, 每行一句
	let $strAll = [];
	Array.from(geb('Main_'+ $id_Num).getElementsByTagName('span')).filter(item => {
		if(item.attributes.translate.value === 'yes'){
			$spanAll.push(item);

		}
	});

	console.log($spanAll);


	
};



