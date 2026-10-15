var a="";
var zForms=new Array();
				
if(window.tinyMCE){ 
	var url = tinyMCEPopup.getWindowArg("plugin_url");
}
				
				
function zf_submit()
{
	var perma_link = document.getElementById("permalink").value;
	if(perma_link.length==0)
	{
		document.getElementById("permaLinkError").style.display="block";
		document.getElementById("permaLinkError").innerHTML="Please enter your form's public link.";
		document.getElementById("permaContainer").classList.add("errorCont");
	}
	else
	{
		var permaLinkFormWidth = document.getElementById('iframeWidth');
		if(permaLinkFormWidth.value=="")
		{
			permaLinkFormWidth.value="100%";
		}
		var permaLinkFormHeight = document.getElementById('iframeHeight');
		if(permaLinkFormHeight.value=="")
		{
			permaLinkFormHeight.value="600px";
		}	
		insertContent(perma_link,permaLinkFormWidth.value,permaLinkFormHeight.value);
	}
}

function insertContent(src,width,height)
{
		
		var tag = '[zohoForms src=';
		tag += src;
		tag += ' width=';
		tag += width;
		tag += ' height=';
		tag += height;
		tag += '/]';		
		if(window.tinyMCE)
		{
			var tmce_ver=window.tinyMCE.majorVersion;
			if (tmce_ver>="4")
			{
				window.tinyMCE.execCommand('mceInsertContent', false, tag);
			}
			else
			{
				window.tinyMCE.execInstanceCommand('content', 'mceInsertContent', false, tag);
			}
			tinyMCEPopup.editor.execCommand('mceRepaint');
			tinyMCEPopup.close();
		}	
}

function closePopUp(){
	if(window.tinyMCE)
	{
		tinyMCEPopup.close();
	}
}
			
	
function getForms()
{
	if(a!="")
	{
		var len = a.forms.length;
		formList = document.getElementById("formname");
		for(i = 0; i < len;i++)
		{
			var option = document.createElement("option");
			option.text = a.forms[i].display_name;
			option.value = a.forms[i].link_name;
			formList.options.add(option);
			var formAndPerma = new Array();
			formAndPerma[0] = a.forms[i].link_name;
			formAndPerma[1] = a.forms[i].public_url;
			zForms[option.value] = formAndPerma;

		}
	}
					
}
				

function zforms_submit()
{
	var src='', formTitle = '';
	var embedType = $("#zf_embedCatogory").val();
	if(embedType == "formPerma"){
		var perma_link = $.trim(document.getElementById("permalink").value);
		if(perma_link.length==0)
		{
			document.getElementById("permaLinkError").style.display="block";
			document.getElementById("permaLinkError").innerHTML="Please enter your form's public link.";
			document.getElementById("permaContainer").classList.add("zf-wb-errorCont");
			return;
		}
		if(perma_link.toLowerCase().indexOf("https://") !== 0)
		{
			document.getElementById("permaLinkError").style.display="block";
			document.getElementById("permaLinkError").innerHTML="Enter a valid permalink Url";
			document.getElementById("permaContainer").classList.add("zf-wb-errorCont");
			return;
		}
		src = perma_link;
	}else if(embedType == "formSelect"){
		var formName = document.getElementById("formname").value;
		if(formName == "-Select-")
		{		
			document.getElementById("formSelectionError").style.display="block";		
			document.getElementById("formSelectionError").innerHTML="Please select a form.";
			document.getElementById("selctContainer").classList.add("zf-wb-errorCont");
			return;
		}
		src = formName;
		formTitle = $("#formname").find(":selected").text();
	}
	
		var urlParams = '';
		if($("#queryParamsCB").is(":checked")){
			var hasError = false;
			var paramsDiv = $("#urlParamsDiv").find("div[elname=paramsDiv]");
			$(paramsDiv).find("div[eltype=keyValPair]").each(function(index,elem){
				var paramKeyRegex = /^[a-zA-Z0-9-_]+$/;
				var paramKey = $.trim($(elem).find("input[elname=paramKey]").val());
				var paramVal = $.trim($(elem).find("input[elname=value]").val());
				if(!paramKeyRegex.test(paramKey)){
					hasError = true;
					$(elem).find("input[elname=paramKey]").parent("div").addClass("zf-wb-errorCont");
				}
				if(paramKey!='' && paramVal!=''){
					if(urlParams!=''){
						urlParams+="&";
					}
					urlParams+=paramKey+"="+encodeURIComponent(paramVal);
				}
			});
			if(hasError){
				$("#paramError").show();
				return;
			}
		}
		var formWidth = document.getElementById('formWidth');
		var widthUnit = $("#formWidth").closest(".embedInputCont").find("i.selected").attr("size_symbol") || "%";
		if(formWidth.value=="")
		{
			formWidth.value="100"+widthUnit;
		}else if(!/(px|%)$/.test(formWidth.value)){
			formWidth.value=formWidth.value+widthUnit;
		}
		var formHeight = document.getElementById('formHeight');
		var heightUnit = $("#formHeight").closest(".embedInputCont").find("i").attr("size_symbol") || "px";
		if(formHeight.value=="")
		{
			formHeight.value="600"+heightUnit;
		}else if(!/(px|%)$/.test(formHeight.value)){
			formHeight.value=formHeight.value+heightUnit;
		}
		//insertContent(urlBuild,formWidth.value,formHeight.value);
		var tag = '[zohoForms src=';
		tag += src;
		if(formTitle != '') {
			/* 
				When single or double quotes are present in form title, it will be removed. 
				Since encoding value when inserted in tinyMCE editor, get converted to actual string and aria label gets broken when page is previewed. 
				In block editor, value is encoded and saved in shortcode. 
			*/
			var escapedFormTitle = formTitle.replace(/['"]/g, ''); 
			tag += ' formtitle=\'' + escapedFormTitle + '\'';
		}
		tag += ' width=';
		tag += formWidth.value;
		tag += ' height=';
		tag += formHeight.value;

		if(urlParams !=''){
			tag +=' urlparams="'+urlParams+'"';
		}
		tag +=' type=js';
		if(!$("#autoHeightCB").is(":checked")){
			tag +=' autoheight=true'
		}
		tag += '/]';
		insertShortCode(tag);
	//}
}

function insertShortCode(shortCodeString){
		if(window.tinyMCE)
		{
			var tmce_ver=window.tinyMCE.majorVersion;
			if (tmce_ver>="4")
			{
				window.tinyMCE.execCommand('mceInsertContent', false, shortCodeString);
			}
			else
			{
				window.tinyMCE.execInstanceCommand('content', 'mceInsertContent', false, shortCodeString);
			}
			tinyMCEPopup.editor.execCommand('mceRepaint');
			tinyMCEPopup.close();
		}
}

function goToHome(){
	$("#zf_tiny_homeDiv").show();
	$("#permaLinkDiv").hide();
	$("#chooseFormDiv").hide();
	$("#embedActionsDiv").hide();
	selectMappingStep("choose");
}

function selectMappingStep(step){
	if(step == "embed"){
		$("#chooseFormStep").addClass("is-selected");
		$("#configureEmbedStep").addClass("is-selected");
		setStepCompleted("#chooseFormStep", true);
		setStepCompleted("#configureEmbedStep", false);
	}else{
		$("#configureEmbedStep").removeClass("is-selected");
		$("#chooseFormStep").addClass("is-selected");
		setStepCompleted("#chooseFormStep", false);
		setStepCompleted("#configureEmbedStep", false);
	}
}
function setStepCompleted(stepSelector, completed){
	var $step = $(stepSelector);
	if(completed){
		$step.find("span[elname=stepNumber]").hide();
		$step.find("span[elname=tickIcon]").css("display", "");
	}else{
		$step.find("span[elname=stepNumber]").css("display", "");
		$step.find("span[elname=tickIcon]").hide();
	}
}

function selectConnectionCard(card){
	$("#accessZohoFormsCard, #embedUsingPermalinkCard").removeClass("selected");
	$(card).addClass("selected");
}

function proceedFromHome(){
	if($("#accessZohoFormsCard").hasClass("selected")){
		showChooseFormDiv();
	}else if($("#embedUsingPermalinkCard").hasClass("selected")){
		embedPerma();
	}
}			
			
function embedPerma()
{
	$("#zf_tiny_homeDiv").hide();
	$("#zf_embedCatogory").val("formPerma");
	$("#permaLinkDiv").show();
	$("#formSelectionDiv").hide();
	$("#embedActionsDiv").show();
	if(document.getElementById("permaContainer").classList.contains("zf-wb-errorCont"))
	{
		document.getElementById("permaContainer").classList.remove("zf-wb-errorCont");
		document.getElementById("permaLinkError").style.display="none";
	}
	//document.getElementById("publicLink").className= "selected";
	//document.getElementById("permaLinkDiv").style.display="block";
	document.getElementById("chooseFormDiv").style.display= "none";
	selectMappingStep("embed");
}
		
var signInTabOpened = false;
function openSignInTab(formsUrl){
	if(!signInTabOpened && formsUrl !=""){
		signInTabOpened = true;
		window.open(formsUrl);
	}
	$("#zDomaindiv").hide();
	$("#zfCreateFormDiv").hide();
	document.getElementById("zfRefreshDiv").style.display="flex";
}
function appendScript()
{
	var scriptToAppend = document.createElement("script");
	scriptToAppend.type = "text/javascript";
	scriptToAppend.id="api";
	scriptToAppend.src = url+"/dynamicScript.js";
	document.head.appendChild(scriptToAppend);
}
function chooseForm()
{
	if(!document.getElementById("api")||a=="")
	{
		appendScript();
	}
	else
	{
		selectForm();
	}
}
function showChooseFormDiv()
{
	$("#zf_tiny_homeDiv").hide();
	$("#zf_embedCatogory").val("formSelect");
	document.getElementById("permaLinkDiv").style.display= "none";
	if(a!="" && a.forms && a.forms.length > 0){
		$("#chooseFormDiv").hide();
		$("#formSelectionDiv").show();
		$("#embedActionsDiv").show();
		selectMappingStep("embed");
		return;
	}
	document.getElementById("chooseFormDiv").style.display="block";
	showEmbedActionsDiv();
}

function proceedToSelectFormOnTinyMce(){
	var domainValue = $("#zf_domain").val();
	if(domainValue == "-select-"){
		$("#domainErr").show();
		$("#zDomaindiv").addClass("zf-wb-errorCont");
		return;
	}
	var formsUrl = getZohoFormsURL(domainValue);
	if(formsUrl !=""){
		signInTabOpened = false;
		var refreshVisible = $("#zfRefreshDiv").is(":visible");
		var loaderElem = refreshVisible ? $("#refreshLoadingImgElem") : $("#connectLoadingImgElem");
		loaderElem.show();
		getZohoFormsLisOnTinyMce(formsUrl);
		setTimeout(function() {
    		loaderElem.hide();
    		if(a==""){
				openSignInTab(formsUrl);
				return;
			}
    		$("#zDomaindiv").hide();
    		$("#zfRefreshDiv").hide();
    		if(a.forms.length == 0){
				$("#zfCreateFormDiv").show();
			}else{
				$("#chooseFormDiv").hide();
				$("#permaLinkDiv").hide();
				$("#formSelectionDiv").show();
				$("#embedActionsDiv").show();
				selectMappingStep("embed");
			}
			
		}, 2000);
	}
}
function getZohoFormsLisOnTinyMce(formsUrl){
  			var apiURL = formsUrl+"/api/getforms?type=plugin";
  			getFormsAndIncludeScriptOnTinyMce(apiURL,addToFormListDropDown);
  		}

		function addToFormListDropDown(){
  			if(a!=""){
  				var len = a.forms.length;
  				if(len > 0){
  				
	  				var formList =document.getElementById("formname");
	  				for(i = 0; i < len;i++){
	  					var option = document.createElement("option");
						option.text = a.forms[i].display_name;
						option.value = a.forms[i].public_url;
						formList.options.add(option);
	  				}
	  				if($("#formname").data("select2")){
	  					$("#formname").trigger("change.select2");
	  				}
	  				$("#chooseFormDiv").hide();
	  				$("#permaLinkDiv").hide();
	  				$("#formSelectionDiv").show();
	  				$("#embedActionsDiv").show();
	  				selectMappingStep("embed");
  				}
  			}else{
  				openSignInTab(getZohoFormsURL($("#zf_domain").val()));
  			}
  		}
  		function getFormsAndIncludeScriptOnTinyMce(url,callback)
		{
		    var script = document.createElement("script")
		    script.type = "text/javascript";
		    if (script.readyState)
		    {  
			//IE

			script.onreadystatechange = function(){ 		
		            if (script.readyState == "loaded" || script.readyState == "complete")
			    	{
		                script.onreadystatechange = null;
		                callback();
		            }
		        };
		    } 
		    else 
		    {
			//Others
		       script.onload = function(){
		            callback();
		        };
		        script.onerror = function(){
		    		callback();
		    	};
		    }	
		    script.src = url;
		    document.getElementsByTagName("head")[0].appendChild(script);	
		}
//constructing url based on domain extention
function getZohoFormsURL(domain){
  	if(domain != undefined && domain.length != 0 && domain != "-select-"){
  		if(domain == ".com" || domain == ".eu" || domain == ".com.cn" || domain == ".com.au" || domain == ".in" || domain == ".jp" || domain == ".sa") {
  			return "https://forms.zoho"+domain;
		}else if(domain == ".ca") {
			return "https://forms.zohocloud" + domain;
		}else {
			return "";
		}
  	}else{
  		return "";
  	}
}
function getZohoURL(domain){
	if(domain != undefined && domain.length != 0 && domain != "-select-"){
		if(domain == ".ca") {
			return "https://zohocloud"+domain;
		}else {
  			return "https://zoho"+domain;
		}
  	}else{
  		return "";
  	}
}
function hideDomainSelctError(){
	$("#zDomaindiv").removeClass("zf-wb-errorCont");
	$("#domainErr").hide();
}

function hideError()
{
	if(document.getElementById("permaContainer").classList.contains("zf-wb-errorCont"))
	{
		document.getElementById("permaContainer").classList.remove("zf-wb-errorCont");
		document.getElementById("permaLinkError").style.display="none";
	}
	if(document.getElementById("selctContainer").classList.contains("zf-wb-errorCont")){
		document.getElementById("formSelectionError").style.display="none";
		document.getElementById("selctContainer").classList.remove("zf-wb-errorCont");
	}
}



function selectForm()
{
	document.getElementById("selectForm").classList.add("selected");
	if(document.getElementById("selctContainer").classList.contains("zf-wb-errorCont"))
	{
		document.getElementById("selctContainer").classList.remove("zf-wb-errorCont");
		document.getElementById("formSelectionError").style.display="none";
	}
		
	if(a!="")
	{
		if(a.forms.length==0)
		{
			document.getElementById("zfCreateFormDiv").style.display="block";
			document.getElementById("chooseFormDiv").style.display="none";
		}
		else
		{
			document.getElementById("chooseFormDiv").style.display="block";
		}	
	}
	else
	{
		openSignInTab(getZohoFormsURL($("#zf_domain").val()));
	}
	document.getElementById("permaLinkDiv").style.display= "none";
	if(a!=""){
		document.getElementById("zfRefreshDiv").style.display="none";
	}
	document.getElementById("publicLink").className= "none";
}
		
function refresh()
{
	
	if(document.getElementById("api"))
	{
		document.getElementById("api").remove();
	}
	chooseForm();
}

function createForm()
{
	var domainValue = $("#zf_domain").val();
	var formsUrl = getZohoFormsURL(domainValue);
	if(formsUrl !=""){
		window.open(formsUrl);	
		document.getElementById("zfRefreshDiv").style.display="flex";	
		document.getElementById("zfCreateFormDiv").style.display="none";
	}
}

function showOrHideUrlParamsDiv(){
	$("#paramError").hide();
	if($("#queryParamsCB").is(":checked")){
		var urlParamsDiv = $("#urlParamsDiv");
		var paramsDiv = $(urlParamsDiv).find("div[elname=paramsDiv]");
		$(paramsDiv).empty();
		var newParam = $(urlParamsDiv).find("div[elname=paramTemplate]").clone();
		$(newParam).removeAttr("elname");
		$(newParam).css("display", "");
		$(paramsDiv).append($(newParam));
		$(urlParamsDiv).slideDown();
	}else{
		$("#urlParamsDiv").slideUp();
	}
}
function addUrlParam(elem){
	var urlParamsDiv = $("#urlParamsDiv");
	var newParam = $(urlParamsDiv).find("div[elname=paramTemplate]").clone();
	$(newParam).removeAttr("elname");
	$(newParam).css("display", "");
	$(newParam).insertAfter($(elem).parent().parent("div[eltype=keyValPair]"));
}

function deleteParam(elem){
	$(elem).parent().parent("div").remove();
	var urlParamsDiv = $("#urlParamsDiv");
	var paramsDiv = $(urlParamsDiv).find("div[elname=paramsDiv]");
	var parmsCount = $(paramsDiv).find("div[eltype=keyValPair]").length;
	if(parmsCount == 0){
		$("#queryParamsCB").prop("checked",false);
		$("#urlParamsDiv").slideUp();
	}
}
function showEmbedActionsDiv(){
	var formname = $("#formname").val();
	if(formname !="-Select-"){
		$("#embedActionsDiv").slideDown();
		selectMappingStep("embed");
	}
}
function selectWidthUnit(elem){
	$(elem).siblings("i").removeClass("selected");
	$(elem).addClass("selected");
}
function allowOnlyNumbers(elem){
	var value = elem.value.replace(/[^0-9]/g, "");
	if(elem.value !== value){
		elem.value = value;
	}
}
function disableHeight(){
	if($("#autoHeightCB").is(":checked")){
		$("#formHeightDiv").css("display", "");
	}else{
		$("#formHeightDiv").hide();
	}
}

function hideparamError(elem){
	$(elem).parent("div").removeClass("zf-wb-errorCont");
	$("#paramError").hide();
}

jQuery(function(){
	/*setTimeout(function(){
		if(!window.tinyMCEPopup || !tinyMCEPopup.uiWindow || !url){
			return;
		}
		var titleEl = tinyMCEPopup.uiWindow.getEl("title");
		if(!titleEl || titleEl.getElementsByTagName("img").length){
			return;
		}
		var icon = titleEl.ownerDocument.createElement("img");
		icon.src = url + "/../images/zohoforms.png";
		icon.alt = "";
		icon.style.width = "18px";
		icon.style.height = "18px";
		icon.style.marginRight = "8px";
		icon.style.verticalAlign = "middle";
		titleEl.insertBefore(icon, titleEl.firstChild);
	}, 0);*/
	function setupSelect(selector, onChange){
		var $el = jQuery(selector);
		if(!$el.length || !jQuery.fn.select2 || $el.data("select2")){
			return;
		}
		$el.select2({
			width: "100%",
			dropdownParent: jQuery(".zf-WpPopupContainer"),
			minimumResultsForSearch: Infinity
		});
		if(onChange){
			$el.on("change.zfSelect2", onChange);
		}
	}
	setupSelect("#zf_domain", hideDomainSelctError);
	setupSelect("#formname");
	jQuery(document).on("mousedown.zfSelect2", function(event){
		if(jQuery(event.target).closest(".select2-container").length){
			return;
		}
		jQuery("#zf_domain, #formname").each(function(){
			var $el = jQuery(this);
			if($el.data("select2")){
				$el.select2("close");
			}
		});
	});
});
