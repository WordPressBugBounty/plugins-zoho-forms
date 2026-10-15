

var wpElem = wp.element;
var wpCreateElem = wpElem.createElement;
var favIcon = wpCreateElem("img", {
  	src: zohoFormsBlock.favIconPath,
  	alt: "Zoho Forms"
});
var zohoFormsAttributes = {
	zf_short_code: {type: 'string'},
	formPerma: {type: 'string'},
	height: {type: 'string'},
	width: {type: 'string'},
	type: {type: 'string'},
	formtitle: {type : 'string'},
	autoheight: {type: 'boolean'},
};
wp.blocks.registerBlockType('zoho/zoho-forms',{
	apiVersion: 3,
	title: 'Zoho Forms',
  	icon: favIcon,
  	category: 'embed',
  	attributes: zohoFormsAttributes,
  	edit:function (props){ //Any edit or onclick of zohoforms block on editor, this edit function will be called.
  		/*
  			1. If form is already embedded using zohoform block, then iframe will be constructed and returned.
  			2. Else, embed popup will be created with createElement function and returned at end of edit function. 
		*/
  		var zformsShortCode = props.attributes.zf_short_code;
  		var isEmbedded = zformsShortCode !=undefined && zformsShortCode.length!=0;
  		// The block renders inside the editor iframe, so DOM lookups must be scoped to this block's element, not the admin document.
  		var blockRef = wpElem.useRef(null);
  		var blockProps = wp.blockEditor.useBlockProps({ ref: blockRef, className: isEmbedded ? undefined : "zf-wb-containerWrapper" });
  		function getElem(selector){
  			return jQuery(blockRef.current).find(selector);
  		}
  		wpElem.useEffect(function(){
  			if(!blockRef.current || !jQuery.fn.select2){
  				return;
  			}
  			var $block = jQuery(blockRef.current);
  			var ownerDoc = blockRef.current.ownerDocument;
  			function setupSelect(selector, onChange){
  				var $el = $block.find(selector);
  				if(!$el.length || $el.data("select2")){
  					return;
  				}
  				$el.select2({
  					width: "100%",
  					dropdownParent: $block,
  					minimumResultsForSearch: Infinity
  				});
  				$el.on("change.zfSelect2", onChange);
  			}
  			setupSelect("#zf_domain", hideDomainError);
  			setupSelect("#zf_formslist", formSelectOnchange);
  			function closeSelect2OnOutsideClick(event){
  				if(jQuery(event.target).closest(".select2-container").length){
  					return;
  				}
  				$block.find("#zf_domain, #zf_formslist").each(function(){
  					var $el = jQuery(this);
  					if($el.data("select2")){
  						$el.select2("close");
  					}
  				});
  			}
  			jQuery(ownerDoc).on("mousedown.zfSelect2", closeSelect2OnOutsideClick);
  			return function(){
  				jQuery(ownerDoc).off("mousedown.zfSelect2", closeSelect2OnOutsideClick);
  				$block.find("#zf_domain, #zf_formslist").each(function(){
  					var $el = jQuery(this);
  					$el.off("change.zfSelect2");
  					if($el.data("select2")){
  						$el.select2("destroy");
  					}
  				});
  			};
  		}, []);
  		var isAutoHeight = props.attributes.autoheight === true || props.attributes.autoheight === "true";
  		wpElem.useEffect(function(){
  			if(!isAutoHeight || !blockRef.current){
  				return;
  			}
  			var ownerWindow = blockRef.current.ownerDocument.defaultView;
  			if(!ownerWindow){
  				return;
  			}
  			function onFormResize(event){
  				var evntData = event.data;
  				if(!evntData || evntData.constructor != String || !blockRef.current){
  					return;
  				}
  				var zf_ifrm_data = evntData.split("|");
  				if(zf_ifrm_data.length != 2 && zf_ifrm_data.length != 3){
  					return;
  				}
  				var iframe = blockRef.current.querySelector("iframe");
  				if(!iframe){
  					return;
  				}
  				var zf_perma = zf_ifrm_data[0];
  				if(iframe.src.indexOf("formperma") < 0 || iframe.src.indexOf(zf_perma) < 0){
  					return;
  				}
  				var zf_ifrm_ht_nw = (parseInt(zf_ifrm_data[1], 10) + 15) + "px";
  				var prevIframeHeight = iframe.style.height;
  				var zf_tout = false;
  				if(zf_ifrm_data.length == 3){
  					iframe.scrollIntoView();
  					zf_tout = true;
  				}
  				if(prevIframeHeight != zf_ifrm_ht_nw){
  					if(zf_tout){
  						ownerWindow.setTimeout(function(){
  							iframe.style.height = zf_ifrm_ht_nw;
  						}, 500);
  					}else{
  						iframe.style.height = zf_ifrm_ht_nw;
  					}
  				}
  			}
  			ownerWindow.addEventListener("message", onFormResize, false);
  			return function(){
  				ownerWindow.removeEventListener("message", onFormResize, false);
  			};
  		}, [isAutoHeight, props.attributes.formPerma]);
  		if(isEmbedded){
  			var iframeSrc = props.attributes.formPerma;
  			if(isAutoHeight && iframeSrc && iframeSrc.indexOf("zf_rszfm=") === -1){
  				iframeSrc += (iframeSrc.indexOf("?") === -1 ? "?" : "&") + "zf_rszfm=1";
  			}
  			return wpCreateElem("div", blockProps, wpCreateElem("iframe", {src: iframeSrc, width: props.attributes.width, height: props.attributes.height, style: { border: "none", width: props.attributes.width, height: props.attributes.height, transition: "all 0.5s ease" }, frameborder:"0", allow : "geolocation;microphone;camera", "aria-label" : props.attributes.formtitle}));
  		}
		var $ = jQuery;
		function deleteParam(elem){
			$(elem).parent().parent("div").remove();
			var urlParamsDiv = getElem("#urlParamsDiv");
			var paramsDiv = $(urlParamsDiv).find("div[elname=paramsDiv]");
			var parmsCount = $(paramsDiv).find("div[eltype=keyValPair]").length;
			if(parmsCount == 0){
				getElem("#queryParamsCB").prop("checked",false);
				getElem("#urlParamsDiv").slideUp();
			}
		}
		function addNewParam(elem){
			var urlParamsDiv = getElem("#urlParamsDiv");
			var newParam = $(urlParamsDiv).find("div[elname=paramTemplate]").clone();
			$(newParam).removeAttr("elname");
			$(newParam).css("display", "");
			bindParamRow(newParam);
			$(newParam).insertAfter($(elem).parent().parent("div[eltype=keyValPair]"));
		}
		function hideparamError(elem){
			$(elem).parent("div").removeClass("zf-wb-errorCont");
			getElem("#paramError").hide();
		}
		// Inline onclick strings would resolve against the iframe's window, where these functions don't exist.
		function bindParamRow(row){
			$(row).find("input[elname=paramKey]").on("change", function(){ hideparamError(this); });
			$(row).find("span[elname=deleteParam]").on("click", function(){ deleteParam(this); });
			$(row).find("span[elname=addParam]").on("click", function(){ addNewParam(this); });
		}
  		//to go to home 
  		function goToHomeDiv(){
  			getElem("#formPermaLinkPasteDiv").hide();
  			getElem("#chooseZohoFormDiv").hide();
  			getElem("#blockEditShortCodeDiv").hide();
  			getElem("#zfHomeDiv").show();
  			getElem("#embedActionsDiv").hide();
  			selectMappingStep("choose");
  		}
  		function selectMappingStep(step){
  			if(step == "embed"){
  				getElem("#chooseFormStep").addClass("is-selected");
  				getElem("#configureEmbedStep").addClass("is-selected");
  				setStepCompleted("#chooseFormStep", true);
  				setStepCompleted("#configureEmbedStep", false);
  			}else{
  				getElem("#configureEmbedStep").removeClass("is-selected");
  				getElem("#chooseFormStep").addClass("is-selected");
  				setStepCompleted("#chooseFormStep", false);
  				setStepCompleted("#configureEmbedStep", false);
  			}
  		}
  		function setStepCompleted(stepSelector, completed){
  			var $step = getElem(stepSelector);
  			if(completed){
  				$step.find("span[elname=stepNumber]").hide();
  				$step.find("span[elname=tickIcon]").css("display", "");
  			}else{
  				$step.find("span[elname=stepNumber]").css("display", "");
  				$step.find("span[elname=tickIcon]").hide();
  			}
  		}
  		function selectConnectionCard(event){
  			getElem("#accessZohoFormsCard, #embedUsingPermalinkCard").removeClass("selected");
  			$(event.currentTarget).addClass("selected");
  		}
  		function proceedFromHome(){
  			if(getElem("#accessZohoFormsCard").hasClass("selected")){
  				getElem("#blockEditShortCodeDiv").hide();
  				chooseForm();
  			}else if(getElem("#embedUsingPermalinkCard").hasClass("selected")){
  				getElem("#blockEditShortCodeDiv").hide();
  				embedPerma();
  			}
  		}

  		//hide perma link error
  		function hideError(){
  			var permaLinkErrElem = getElem('#permaLinkError');
  			$(permaLinkErrElem).parent().removeClass("zf-wb-errorCont");
  			$(permaLinkErrElem).hide();
  		}
  		function formSelectOnchange(){
  			hideFormSelectError();
  			showEmbedActionsDiv();
  		}
  		function showEmbedActionsDiv(){
  			var formName = getElem("#zf_formslist").val();
  			if(formName!="-select-"){
  				getElem("#embedActionsDiv").show();
  				selectMappingStep("embed");
  			}
  		}
  		//This function will be called on clicking embed button after choosing form details.
  		function zf_block_embed(){
  			var formPerma='', formTitle = '';
  			if(getElem("#embedCatogory").val()=="formPerma"){
	  			formPerma = String(getElem("#permalink").val()).trim();
	  			var permaLinkErrElem = getElem('#permaLinkError');
	  			if(formPerma.length==0){
	  				$(permaLinkErrElem).text("Please enter your form's permalink URL.");
	  				$(permaLinkErrElem).parent().addClass("zf-wb-errorCont");
	  				$(permaLinkErrElem).show();
	  				return;
	  			}
	  			if(formPerma.toLowerCase().indexOf("https://") !== 0){
	  				$(permaLinkErrElem).text("Enter a valid permalink Url");
	  				$(permaLinkErrElem).parent().addClass("zf-wb-errorCont");
	  				$(permaLinkErrElem).show();
	  				return;
	  			}
  			}else{
	  			formPerma = getElem("#zf_formslist").val();
	  			if(formPerma.length==0 || formPerma =="-select-"){
	  				var formSelectError = getElem("#formSelectError");
	  				$(formSelectError).parent().addClass("zf-wb-errorCont");
	  				$(formSelectError).show();
	  				return;
	  			}
	  			formTitle = getElem("#zf_formslist").find(":selected").text();
  			}
  			var widthVal = getElem("#formWidth").val();
  			var widthUnit = getElem("#formWidth").closest(".embedInputCont").find("i.selected").attr("size_symbol") || "%";
  			if(widthVal == ""){
  				widthVal = "100" + widthUnit;
  			}else if(!/(px|%)$/.test(widthVal)){
  				widthVal = widthVal + widthUnit;
  			}
  			var heightVal = getElem("#formHeight").val();
  			var heightUnit = getElem("#formHeight").closest(".embedInputCont").find("i").attr("size_symbol") || "px";
  			if(heightVal == ""){
  				heightVal = "600" + heightUnit;
  			}else if(!/(px|%)$/.test(heightVal)){
  				heightVal = heightVal + heightUnit;
  			}
  			var embedType = "js";
			var autoHeight = !getElem("#autoHeightCB").is(":checked");
			var urlParams = '';
			if(getElem("#queryParamsCB").is(":checked")){
				var hasError = false;
				var paramsDiv = getElem("#urlParamsDiv").find("div[elname=paramsDiv]");
				$(paramsDiv).find("div[eltype=keyValPair]").each(function(index,elem){
					var paramKeyRegex = /^[a-zA-Z0-9-_]+$/;
					var paramKey = String($(elem).find("input[elname=paramKey]").val()).trim();
					var paramVal = String($(elem).find("input[elname=value]").val()).trim();
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
					getElem("#paramError").show();
					return;
				}
			}
  			saveShortCode(formPerma,widthVal,heightVal,embedType,autoHeight,urlParams, formTitle);
  		}
  		//form select error
  		function hideFormSelectError(){
  			var formSelectError = getElem("#formSelectError");
  			$(formSelectError).parent().removeClass("zf-wb-errorCont");
  			$(formSelectError).hide();
  		}


  		//saving shotcode and rendering the form
  		function saveShortCode(formPerma,width,height,embedType,autoHeight,urlParams, formTitle){
  			var escapedFormTitle = formTitle.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  			var shortCode="[zohoForms formtitle='" + escapedFormTitle + "' src="+formPerma+" width="+width+" height="+height+" type="+embedType+" autoheight="+autoHeight+" urlparams="+urlParams+" /]";
  			var iframe = wpCreateElem("iframe",{src: formPerma,width: width,height: height,frameborder:"0"});
  			props.setAttributes({zf_short_code:shortCode});
  			props.setAttributes({formPerma:formPerma});
  			props.setAttributes({height:height});
  			props.setAttributes({width:width});
  			props.setAttributes({type:embedType});
  			props.setAttributes({autoheight:autoHeight});
  			props.setAttributes({formtitle:formTitle});
  			getElem("#formPermaLinkPasteDiv").hide();
  			getElem("#blockEditShortCodeDiv").html(iframe);
  			getElem("#blockEditShortCodeDiv").show();
  		}
  		//while choosing embed form threw perma url
  		function embedPerma(){
  			hideError();
  			getElem("#zfHomeDiv").hide();
			getElem("#chooseZohoFormDiv").hide();
  			getElem("#formPermaLinkPasteDiv").show();
  			getElem("#zFormSelectDiv").hide();
  			getElem("#permalink").focus();
  			getElem("#embedActionsDiv").show();
  			getElem("#embedCatogory").val("formPerma");
  			selectMappingStep("embed");
  		}
  		//while choosing embed form threw formslist
  		function chooseForm(){
  			getElem("#embedCatogory").val("formSelect");
  			getElem("#embedActionsDiv").hide();
  			hideFormSelectError();
  			hideDomainError();
  			getElem("#zfHomeDiv").hide();
  			getElem("#formPermaLinkPasteDiv").hide();
  			getElem("#chooseZohoFormDiv").show();
  			if(typeof a =="undefined" || a == ""){
				getElem("#zDomaindiv").show();
		  		getElem("#zFormSelectDiv").hide();	
		  		getElem("#zfRefreshDiv").hide();
	  			getElem("#zfCreateFormDiv").hide();
  			}
  			showEmbedActionsDiv();
  		}
  		//Getting zoho forms and adding to list
  		function getZohoForms(){
  			var refreshVisible = getElem("#zfRefreshDiv").is(":visible");
  			var domainVisible = getElem("#zDomaindiv").is(":visible");
  			if(!refreshVisible){
  				getElem("#zfRefreshDiv").hide();
  			}
  			var newScript = document.createElement("script");
			var inlineScript = document.createTextNode("var a='';");
			newScript.appendChild(inlineScript); 
			document.getElementsByTagName("head")[0].appendChild(newScript);
  			var domain = getElem("#zf_domain").val();
  			if(domain != undefined && domain.length != 0 && domain != "-select-"){
	  			var zohoFormsURL = getZohoFormsURL(domain);
	  			resetFormsList();
	  			if(zohoFormsURL != ""){
	  				if(domainVisible){
	  					getElem("#connectLoadingImgElem").show();
	  					getZohoFormsList(zohoFormsURL, "connect");
	  				}else if(refreshVisible){
	  					getElem("#refreshLoadingImgElem").show();
	  					getZohoFormsList(zohoFormsURL, "refresh");
	  				}else{
	  					getElem("#zDomaindiv").hide();
	  					getZohoFormsList(zohoFormsURL, false);
	  				}
	  			}else{
	  				getElem("#zFormSelectDiv").hide();
	  				//getElem("#zFsigninDiv").hide();
	  				getElem("#zfRefreshDiv").hide();
	  				getElem("#zfCreateFormDiv").hide();
	  			}
  			}else{
  				var domainError = getElem("#domainErr");
  				$(domainError).parent().addClass("zf-wb-errorCont");
  				$(domainError).show();
  			}
  		}
  		//hide Domain Error
  		function hideDomainError(){
  			var domainError = getElem("#domainErr");
  			$(domainError).parent().removeClass("zf-wb-errorCont");
  			$(domainError).hide();
  		}
  		//reset forms list
  		function syncSelect2(selector){
  			var $el = getElem(selector);
  			if($el.length && $el.data("select2")){
  				$el.trigger("change.select2");
  			}
  		}
  		function resetFormsList(){
  			hideFormSelectError();
  			var $list = getElem("#zf_formslist");
  			if($list.data("select2")){
  				$list.select2("close");
  			}
  			$list.find("option").remove();
  			$list.append("<option value='-select-'>-Select-</option>");
  			$list.val("-select-");
  			syncSelect2("#zf_formslist");
  		}
  		//constructing url based on domain extention
  		function getZohoFormsURL(domain){
  			if(domain != undefined && domain.length != 0 && domain != "-select-"){
  				if(domain == ".ca") {
  					return "https://forms.zohocloud" + domain;
  				}else {
  					return "https://forms.zoho"+domain;
					}
  			}else{
  				return "";
  			}
  		}
  		//calling api and adding to dropdown
  		function getZohoFormsList(formsUrl, loader){
  			var apiURL = formsUrl+"/api/getforms?type=plugin";
  			if(!loader){
  				getElem("#loadingDiv").show();
  			}
  			getFormsAndIncludeScript(apiURL, function(){
  				if(loader == "connect"){
  					getElem("#connectLoadingImgElem").hide();
  					getElem("#zDomaindiv").hide();
  				}else if(loader == "refresh"){
  					getElem("#refreshLoadingImgElem").hide();
  					getElem("#zfRefreshDiv").hide();
  				}
  				addToFormListDropDown();
  			});
  		}
  		function showOrHideUrlParamsDiv(){
  			getElem("#paramError").hide();
  			if(getElem("#queryParamsCB").is(":checked")){
  				var urlParamsDiv = getElem("#urlParamsDiv");
				var paramsDiv = $(urlParamsDiv).find("div[elname=paramsDiv]");
				$(paramsDiv).empty();
				var newParam = $(urlParamsDiv).find("div[elname=paramTemplate]").clone();
				$(newParam).removeAttr("elname");
				bindParamRow(newParam);
				$(newParam).css("display", "");
				$(paramsDiv).append($(newParam));
				$(urlParamsDiv).slideDown();
			}else{
				getElem("#urlParamsDiv").hide();
			}
  		}

		function selectWidthUnit(event){
			var $unit = jQuery(event.currentTarget);
			$unit.siblings("i").removeClass("selected");
			$unit.addClass("selected");
		}
		function allowOnlyNumbers(event){
			var value = event.target.value.replace(/[^0-9]/g, "");
			if(event.target.value !== value){
				event.target.value = value;
			}
		}
		function disableOrEnableHeight(){
			if(getElem("#autoHeightCB").is(":checked")){
				getElem("#formHeightDiv").css("display", "");
			}else{
				getElem("#formHeightDiv").hide();
			}
		}
  		
  		function getFormsAndIncludeScript(url,callback)
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
		function getFormsWithFetch(){
			fetch("/wp-json/zohoforms/v1/getforms")
				.then(function(response){ return response.json(); })
				.then(function(data){
					a = data;
					addToFormListDropDown();
				});
		}
  		function addToFormListDropDown(){
  			getElem("#zfRefreshDiv").hide();
  			getElem("#zfCreateFormDiv").hide();
  			if(a!=""){
  				var len = a.forms.length;
  				if(len == 0){
  					getElem("#zfCreateFormDiv").show();
  					getElem("#zFormSelectDiv").hide();
  				}else{
	  				var formList = getElem("#zf_formslist")[0];
	  				for(var i = 0; i < len;i++){
	  					var option = formList.ownerDocument.createElement("option");
						option.text = a.forms[i].display_name;
						option.value = a.forms[i].public_url;
						formList.options.add(option);
	  				}
	  				syncSelect2("#zf_formslist");
	  				getElem("#zFormSelectDiv").show();
	  				getElem("#formPermaLinkPasteDiv").hide();
	  				getElem("#embedActionsDiv").show();
	  				selectMappingStep("embed");
  				}
  			}else{
  				getElem("#zFormSelectDiv").hide();
  				openSigninOrCreateForm();
  			}
  			getElem("#loadingDiv").hide();
  		}
  		//Redirecting for  signIn or create Form and loading refresh.
  		function openSigninOrCreateForm(){
  			var domain = getElem("#zf_domain").val();
  			var zohoFormsURL = getZohoFormsURL(domain);
  			if(zohoFormsURL !=""){
  				window.open(zohoFormsURL);
  				getElem("#zfCreateFormDiv").hide();
  				getElem("#zfRefreshDiv").show();
  			}
  		}
  		/*
  			When form is not embedded already, popup will be constructed with createElement function and then returned finally at end of edit function.
		*/
  		var domainDropDownElem = wpCreateElem("div",
		    						{
		      							id: "zDomaindiv"
		    						},
		    						wpCreateElem("div",
		    							{
		    								class: "zf-wb-innerWrapper zconnectMainCont"
		    							},
		    						wpCreateElem("label",null,"Select the domain your Zoho account is registered on.",wpCreateElem("em",null,"*")),
		    						wpCreateElem("div",
		    							{
		    								class: "zf-wb-dropWrapper"
		    							},
		    							wpCreateElem("select",
											{
									        	id: "zf_domain",
									        	onChange: hideDomainError,
									      	},
									      	wpCreateElem("option",
									        	{
									          		value: "-select-"
									        	},
									        	"-Select-"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".com"
									        	},
									        	"zoho.com"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".eu"
									        	},
									        	"zoho.eu"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".com.cn"
									        	},
									        	"zoho.com.cn"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".in"
									        	},
									        	"zoho.in"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".com.au"
									        	},
									        	"zoho.com.au"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".jp"
									        	},
									        	"zoho.jp"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".ca"
									        	},
									        	"zohocloud.ca"
									      	),
									      	wpCreateElem("option",
									        	{
									          		value: ".sa"
									        	},
									        	"zoho.sa"
									      	)
									    )
									),
		    						wpCreateElem("p",{ id:"domainErr", style:{display:'none'}},"Please choose a domain.")
		    						),
		    						wpCreateElem("div",
		    							{
		    								class: "connFormFooter"
		    							},
		    							wpCreateElem("button", { onClick: goToHomeDiv }, "Back"),
		    							wpCreateElem("button",
		    								{
		    									class: "greenBtnNew",
		    									onClick: getZohoForms
		    								},
		    								wpCreateElem("em", { id: "connectLoadingImgElem", class: "newBtnLoader", style: { display: "none" } }),
		    								"Connect"
		    							)
		    						)
		  						);
		var formListEmbedDiv = wpCreateElem("div",
		    						{
		    							id: "zFormSelectDiv", 
		    							style: {
		        							display: 'none',
		      							},
		      							class: "zf-wb-innerWrapper zf-wb-outerWrapper"
		      						},
		      						wpCreateElem("div",
		      							{
		      								class: "zf-wb-innerWrapper"
		      							},
		      						wpCreateElem("label",null,"Choose a form",wpCreateElem("em",null,"*")),
		      						wpCreateElem("div",
		      							{
		      								class: "zf-wb-dropWrapper"
		      							},
			      						wpCreateElem("select", 
			      							{
				      							id: "zf_formslist",
				      							onChange : formSelectOnchange
				      						},
				      						wpCreateElem("option",
						        				{
						          					value: "-select-"
						        				},
						        				"-Select-"
						   					)
						   				)
		      						),
		    						wpCreateElem("p",{id: "formSelectError",style: {display: 'none'}},"Please select a form.")),
		  						);
		var refreshDiv = wpCreateElem("div",
			  				{
							    id: "zfRefreshDiv",
							    class: "refreshCont",
							    style: {
							      display: 'none'
							    }
			  				},
			  				wpCreateElem("img", { src: zohoFormsBlock.refreshFormIcon }),
			  				wpCreateElem("h3", null, "Sign in on the Zoho page, then come back and refresh to load your forms."),
			  				wpCreateElem("div", { class: "refFormFooter" },
			  					wpCreateElem("button", { onClick: goToHomeDiv }, "Back"),
			  					wpCreateElem("button", { class: "greenBtnNew", onClick: getZohoForms },
			  						wpCreateElem("em", { id: "refreshLoadingImgElem", class: "newBtnLoader", style: { display: "none" } }),
			  						"Refresh"
			  					)
			  				)
						);
		var createFormDiv = wpCreateElem("div",
								{
								    id: "zfCreateFormDiv",
								    class: "refreshCont",
								    style: {
								      display: 'none'
								    }
							  	},
							  	wpCreateElem("img", { src: zohoFormsBlock.refreshFormIcon }),
							  	wpCreateElem("h3", null, "You don't have any forms."),
							  	wpCreateElem("div", { class: "refFormFooter" },
							  		wpCreateElem("button", { class: "greenBtnNew", onClick: openSigninOrCreateForm },
							  			wpCreateElem("em", { id: "createLoadingImgElem", class: "newBtnLoader", style: { display: "none" } }),
							  			"Create a new form"
							  		)
							  	)
							);
  		var chooseZFormDiv = wpCreateElem("div",
		  						{
								    id: "chooseZohoFormDiv",
								    class: "zf-wb-outerWrapper",
								    style: {
								      display: 'none'
								    }
		  						},
		  						wpCreateElem("div",{id: "loadingDiv", class: "zf-wb-loading" ,style: {display: 'none'}},wpCreateElem("p",null,"loading"),wpCreateElem("div",{class: "zf-wb-spinner"},wpCreateElem("div",{class:"bounce1"}),wpCreateElem("div",{class:"bounce2"}),wpCreateElem("div",{class:"bounce3"}))),
		  						domainDropDownElem,
								refreshDiv,
								createFormDiv
							);

  		var permaLinkEmbedDiv = wpCreateElem("div",
									{
										id : "formPermaLinkPasteDiv",
										class: "zf-wb-outerWrapper",
										style: { display:'none'}
									},
									wpCreateElem("div",
										{ 
											class: "zf-wb-innerWrapper"
										},
										wpCreateElem("label",null,"Enter your form's permalink URL",wpCreateElem("em",null,"*")),
										wpCreateElem("textarea",
						 					{ 
						 						id: "permalink", 
						 						rows: "4", 
						 						onChange: hideError, 
						 						style: { width: '100%' } 
						 					}
						 				),
						 				wpCreateElem("p", { id: "permaLinkError", style: {display:'none'} },"Please enter the permalink URL."),
						 				wpCreateElem("span",null,"Need help finding your permalink? ",wpCreateElem("a",{href: "https://help.zoho.com/portal/en/kb/forms/sharing-forms/articles/sharing-a-form-publicly#Sharing_a_link", target: "_blank"},"Learn more"))
									),);
		var urlParamsCBDiv = wpCreateElem("div",{
									class: "embedIncldeParamtrs"
								},
								wpCreateElem("div", {class: "cusCheckBox"}, wpCreateElem("input", {
								  type: "checkbox",
								  id: "queryParamsCB",
								  onChange: showOrHideUrlParamsDiv,
								}), wpCreateElem("label", {
								  for: "queryParamsCB"
								}, "Add URL Parameters")),
								wpCreateElem("span",null,"Prefill form fields and track where responses come from."));
		var urlParamDiv = wpCreateElem("div", 
							  {
							    id: "urlParamsDiv",
							    class: "embedParameterValue",
							    style: {display:'none'}
							  }, 
							  wpCreateElem("div", 
							    {
							      class: "embedField"
							    }, 
							    wpCreateElem("div", 
							      {
							        class: "embedFiel_Col1"
							      }, 
							      wpCreateElem("label", null, "Parameter Name")
							    ), 
							    wpCreateElem("div", 
							      {
							        class: "embedFiel_Col2"
							      }, 
							      wpCreateElem("label", null, "Parameter Value")
							      ),
							      
							      
							      
							    ),
							  wpCreateElem("div", 
							      {
							        class: "clearBoth"
							      }), 
							  wpCreateElem("div", 
							        {
							          elname: "paramsDiv"
							        }, 
							        
							      ), 
							  	wpCreateElem("div", 
							        {
							          class: "clearBoth"
							        }
							      ),
							    wpCreateElem("div", {
							    	elname: "paramTemplate",
							    	class: "addparamsWrap",
							    	eltype: "keyValPair",
							    	style: {display:'none'}
							  	}, 

							  	wpCreateElem("div", {
							    	class: "addParamaFeld"
							  	}, wpCreateElem("input", {
							    type: "text",
							    elname: "paramKey",
							    maxlength: "50"
							  })),
							   wpCreateElem("div", {
							    class: "addParamaFeld"
							  },  wpCreateElem("input", {
							    type: "text",
							    elname: "value",
							    maxlength: "50"
							  })), 
							  	wpCreateElem("div",{
							  		class :"zf-Wp-plusminus"
							  	},
							  	wpCreateElem("span",{
							  		class:"fiedPropPlus",
							  		elname: "addParam",
							  	}),
							  	wpCreateElem("span",{
							  		class:"fiedPropMinus",
							  		elname: "deleteParam",
							  	}),
							  	),
							   ) );
		var autoHeightCBDiv = wpCreateElem("div", 
								{
								  id: "autoHeightDiv",
								  class: "cusCheckBox autoHeightDiv"
								}, wpCreateElem("input", {
								  type: "checkbox",
								  id: "autoHeightCB",
								  onChange: disableOrEnableHeight
								}), wpCreateElem("label", {
								  for: "autoHeightCB"
								}, "Set custom height"));
		var embedActionDiv = wpCreateElem("div",
								{
    								id: "embedActionsDiv",
    								class: "embedActionsDiv",
									style: { display:'none'}
  								},
  								wpCreateElem("div", { class: "zconnectMainCont" },
  								formListEmbedDiv,
  								permaLinkEmbedDiv,
  								wpCreateElem("div", { class: "embedFormDivider" }),
  								wpCreateElem("div",
  								{
  									class: "embedFormUsing",
  								},
  								wpCreateElem("div",
      									{
      										class: "embedFormInputField"
      									},
      									wpCreateElem("span", null,
        									wpCreateElem("label", null, "Width "),
        									wpCreateElem("div", { class: "embedInputCont" },
        										wpCreateElem("input", {
									            	type: "text",
									            	id: "formWidth",
									            	placeholder: "100",
									            	onInput: allowOnlyNumbers
					          					}),
					          					wpCreateElem("div", { class: "embedInputPer" },
					          						wpCreateElem("i", { onClick: selectWidthUnit, size_symbol: "px" }, "px"),
					          						wpCreateElem("i", { class: "selected", onClick: selectWidthUnit, size_symbol: "%" }, "%")
					          					)
        									)
        								),
        								autoHeightCBDiv,
					      				wpCreateElem("span",
					        				{
					        					id: "formHeightDiv",
					        					style: { display: "none" }
					        				},
					        				wpCreateElem("label", null, "Height "),
					        				wpCreateElem("div", { class: "embedInputCont" },
					        					wpCreateElem("input", {
					            					type: "text",
					            					id: "formHeight",
					            					class: "formHeight",
					            					placeholder: "600",
					            					onInput: allowOnlyNumbers
					          					}),
					          					wpCreateElem("div", { class: "embedInputPer" },
					          						wpCreateElem("i", { size_symbol: "px" }, "px")
					          					)
					        				)
					        			)
    								)),
    								wpCreateElem("div", { class: "embedFormDivider" }),
									urlParamsCBDiv,
									urlParamDiv,
								   wpCreateElem("div",{
								   		class: "zf-wb-errorCont",
								   		id: "paramError",
								    	style: {display:'none'}
								   },wpCreateElem("p", null,"Parameters should contain only alphanumeric characters, underscore, and hyphen."))
								   ),
    								wpCreateElem("div", { class: "connFormFooter" },
    									wpCreateElem("button", { onClick: goToHomeDiv }, "Back"),
    									wpCreateElem("button", { class: "greenBtnNew", onClick: zf_block_embed },
    										wpCreateElem("em", { elem: "loadingImgElem", class: "newBtnLoader", style: { display: "none" } }),
    										"Embed Form"
    									)
    								)
							);
  		return wpCreateElem("div", 
	  				blockProps,
	  				wpCreateElem("link", 
	  					{
	  						href: zohoFormsBlock.blockCSS,
	  						rel: "stylesheet"
	  					}
	  				),
	  				wpCreateElem("link",
	  					{
	  						href: zohoFormsBlock.select2CSS,
	  						rel: "stylesheet"
	  					}
	  				),
	  				wpCreateElem("input",{
	  					id:"embedCatogory",
	  					type:"hidden",
	  					value:"formPerma"
	  				}),
	  				wpCreateElem("div", { class: "connFormCont" },
	  					wpCreateElem("div", null,
	  						wpCreateElem("div", { class: "connFormHeader" },
	  							wpCreateElem("i", null,
	  								wpCreateElem("img", { src: zohoFormsBlock.zohoFormsIcon })
	  							),
	  							wpCreateElem("h4", null, "Zoho Forms")
	  						),
	  						wpCreateElem("div", { class: "customAddMapping" },
	  							wpCreateElem("a", { id: "chooseFormStep", class: "is-selected" },
	  								wpCreateElem("span", { elname: "stepNumber" }, "1"),
	  								wpCreateElem("span", { elname: "tickIcon", style: { display: "none" } },
	  									wpCreateElem("img", { src: zohoFormsBlock.completedIcon, alt: "" })
	  								),
	  								wpCreateElem("em", null, "Choose Form")
	  							),
	  							wpCreateElem("a", { id: "configureEmbedStep" },
	  								wpCreateElem("span", { elname: "stepNumber" }, "2"),
	  								wpCreateElem("span", { elname: "tickIcon", style: { display: "none" } },
	  									wpCreateElem("img", { src: zohoFormsBlock.completedIcon, alt: "" })
	  								),
	  								wpCreateElem("em", null, "Embed Settings")
	  							)
	  						)
	  					),
						wpCreateElem("div",
			  				{
			    				id: "zfHomeDiv",
			    				class: "connFormInnCont"
			  				},
			  				wpCreateElem("div", { class: "zf-wb-signWrapper zconnectMainCont" },
			  					wpCreateElem("h2", null, "Choose a way to embed your form"),
			  					wpCreateElem("div", { class: "accCardCont" },
			  						wpCreateElem("div", { id: "accessZohoFormsCard", class: "accConectCard", onClick: selectConnectionCard },
			  							wpCreateElem("i", null, wpCreateElem("img", { src: zohoFormsBlock.accessFormIcon })),
			  							wpCreateElem("div", { class: "accCardRight" },
			  								wpCreateElem("h4", null, "Access Zoho Forms"),
			  								wpCreateElem("p", null, "Sign in to Zoho Forms and choose a form.")
			  							)
			  						),
			  						wpCreateElem("div", { id: "embedUsingPermalinkCard", class: "accConectCard", onClick: selectConnectionCard },
			  							wpCreateElem("i", null, wpCreateElem("img", { src: zohoFormsBlock.permalinkIcon })),
			  							wpCreateElem("div", { class: "accCardRight" },
			  								wpCreateElem("h4", null, "Use a Permalink"),
			  								wpCreateElem("p", null, "Embed a form using its permalink URL.")
			  							)
			  						)
			  					)
			  				),
			  				wpCreateElem("div", { class: "connFormFooter" },
			  					wpCreateElem("button", { class: "greenBtnNew", onClick: proceedFromHome }, "Next")
			  				)
						),
		  				chooseZFormDiv,
		  				embedActionDiv
	  				),
	  				wpCreateElem("div", { id: "blockEditShortCodeDiv", style: { display: "none" } })
  				);
  	}, //End of edit function
  	save:function(props){
  		return wpCreateElem("div", wp.blockEditor.useBlockProps.save(), props.attributes.zf_short_code)
  	}, //End of save function
  	deprecated: [
  		{
  			attributes: zohoFormsAttributes,
  			save: function(props){
  				return wpCreateElem("div", null, props.attributes.zf_short_code)
  			}
  		}
  	]
})