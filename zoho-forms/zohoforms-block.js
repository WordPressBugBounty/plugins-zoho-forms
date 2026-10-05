

var wpElem = wp.element;
var wpCreateElem = wpElem.createElement;
var favIcon = wpCreateElem("img", {
  	src: zohoFormsBlock.favIconPath,
  	alt: "Zoho Forms"
});
var backSvgIcon = wpCreateElem('svg', null,
    wpCreateElem('path', { d: "M21 11.016v1.969h-14.156l3.563 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.563 3.609h14.156z"} )
    );
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
  		if(isEmbedded){
  			return wpCreateElem("div", blockProps, wpCreateElem("iframe", {src: props.attributes.formPerma, width: props.attributes.width, height: props.attributes.height, frameborder:"0", allow : "geolocation;microphone;camera", "aria-label" : props.attributes.formtitle}));
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
			$(newParam).show();
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
  			getElem("#zfHomeDiv").show();
  			getElem("#embedActionsDiv").hide();
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
  			}else{
  				getElem("#embedActionsDiv").hide();
  			}
  		}
  		//This function will be called on clicking embed button after choosing form details.
  		function zf_block_embed(){
  			var formPerma='', formTitle = '';
  			if(getElem("#embedCatogory").val()=="formPerma"){
	  			formPerma = getElem("#permalink").val();
	  			if(formPerma.length==0){
	  				var permaLinkErrElem = getElem('#permaLinkError');
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
  			var height = getElem("#formHeight").val();
  			var width = getElem("#formWidth").val();
  			if(height == ""){
  				height = '600px';
  			}
  			if(width == ""){
  				width= '100%';
  			}
  			var embedType= "iframe";
	  		if(getElem("#jsEmbed").is(":checked")){
				embedType ='js';
			}
			var autoHeight = false;
			if(getElem("#autoHeightCB").is(":checked")){
				autoHeight =true;
			}
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
  			saveShortCode(formPerma,width,height,embedType,autoHeight,urlParams, formTitle);
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
  			getElem("#permalink").focus();
  			getElem("#embedActionsDiv").show();
  			getElem("#embedCatogory").val("formPerma");
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
  			getElem("#zfRefreshDiv").hide();
  			var newScript = document.createElement("script");
			var inlineScript = document.createTextNode("var a='';");
			newScript.appendChild(inlineScript); 
			document.getElementsByTagName("head")[0].appendChild(newScript);
  			var domain = getElem("#zf_domain").val();
  			if(domain != undefined && domain.length != 0 && domain != "-select-"){
	  			var zohoFormsURL = getZohoFormsURL(domain);
	  			resetFormsList();
	  			if(zohoFormsURL != ""){
	  				getElem("#zDomaindiv").hide();
	  				getZohoFormsList(zohoFormsURL);
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
  		function resetFormsList(){
  			hideFormSelectError();
  			getElem('#zf_formslist').find('option').remove();
  			getElem('#zf_formslist').append("<option value='-select-'>-Select-</option>");
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
  		function getZohoFormsList(formsUrl){
  			var apiURL = formsUrl+"/api/getforms?type=plugin";
  			getElem("#loadingDiv").show();
  			getFormsAndIncludeScript(apiURL,addToFormListDropDown);
  		}
  		function showiframeOrJsChange(){
  			if(getElem("#jsEmbed").is(":checked")){
				getElem("#autoHeightDiv").slideDown();
			}else{
				getElem("#autoHeightDiv").slideUp();
			}
			getElem("#autoHeightCB").prop("checked",false);
			getElem("#formHeight").prop("disabled",false);
			getElem("#formHeight").prop("placeholder","600px");
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
				$(newParam).show();
				$(paramsDiv).append($(newParam));
				$(urlParamsDiv).slideDown();
			}else{
				getElem("#urlParamsDiv").hide();
			}
  		}

		function disableOrEnableHeight(){
			if(getElem("#autoHeightCB").is(":checked")){
				getElem("#formHeight").prop("disabled",true);
				getElem("#formHeight").prop("placeholder","");
				getElem("#formHeight").val('');
			}else{
				getElem("#formHeight").prop("disabled",false);
				getElem("#formHeight").prop("placeholder","600px");
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
	  				getElem("#zFormSelectDiv").show();
	  				getElem("#embedActionsDiv").show();
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
		      							id: "zDomaindiv",
		      							class: "zf-wb-innerWrapper"
		    						},
		    						wpCreateElem("label",null,"Choose the domain where you've registered your Zoho account.",wpCreateElem("em",null,"*")),
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
		    						wpCreateElem("p",{ id:"domainErr", style:{display:'none'}},"Please choose a domain."),
		    						wpCreateElem("div",{class:"zf-wb-connect-btn zf-wb-Fotter"},wpCreateElem("button", { onClick: getZohoForms, class: "zf-wb-blue" },"Connect"))
		  						);
		var formListEmbedDiv = wpCreateElem("div",
		    						{
		    							id: "zFormSelectDiv", 
		    							style: {
		        							display: 'none',
		      							},
		      							class: "zf-wb-innerWrapper"
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
							    style: {
							      display: 'none'
							    },
							    class: "zf-wb-signWrapper"
			  				},
			  				wpCreateElem("p", null,"Click 'Refresh' to choose a form."),
			  				wpCreateElem("button", {  id: "refreshLink", onClick: getZohoForms, class: "zf-wb-lightblue" },"Refresh")
						);
		var createFormDiv = wpCreateElem("div",
								{
								    id: "zfCreateFormDiv",
								    style: {
								      display: 'none'
								    },
								    class: "zf-wb-signWrapper"
							  	},
			  					wpCreateElem("p", null,"You don't have any forms."),
			  					wpCreateElem("button", {  id: "createFormLink", onClick: openSigninOrCreateForm, class: "zf-wb-green"},"CREATE A NEW FORM")
							);
  		var chooseZFormDiv = wpCreateElem("div",
		  						{
								    id: "chooseZohoFormDiv",
								    class: "zf-wb-outerWrapper",
								    style: {
								      display: 'none'
								    }
		  						},
		  						wpCreateElem("div",
		  							{class: "zf-wb-headwrap"},
		  							wpCreateElem("span",{class: "zf-wb-backIocn", onClick:goToHomeDiv},backSvgIcon),
		  							wpCreateElem("div",{class: "zf-wb-heading"},"Choose your form")
		  						),
		  						wpCreateElem("div",{id: "loadingDiv", class: "zf-wb-loading" ,style: {display: 'none'}},wpCreateElem("p",null,"loading"),wpCreateElem("div",{class: "zf-wb-spinner"},wpCreateElem("div",{class:"bounce1"}),wpCreateElem("div",{class:"bounce2"}),wpCreateElem("div",{class:"bounce3"}))),
		  						domainDropDownElem,
		  						formListEmbedDiv,
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
		  								{class: "zf-wb-headwrap"},
		  								wpCreateElem("span",{class: "zf-wb-backIocn", onClick:goToHomeDiv},backSvgIcon),
		  								wpCreateElem("div",{class: "zf-wb-heading"},"Enter form permalink")
		  							),
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
						 				wpCreateElem("p", { id: "permaLinkError", style: {display:'none'} },"Please enter your form's permalink URL."),
						 				wpCreateElem("span",null,"Not sure where to find the permalink URL? ",wpCreateElem("a",{href: "https://www.zoho.com/forms/help/share/public-sharing.html#link", target: "_blank"},"Click here "),wpCreateElem("span",null,"to learn more."))
									),);
		var embedTypeDIv = wpCreateElem("div", {
								  class: "cusRadioButton",
								  id: "embedTypeDiv"
								}, 
								wpCreateElem("span", {
								  class: ""
								},
								wpCreateElem("input", {
								  type: "radio",
								  id: "iframeEmbed",
								  name: "embedType",
								  onClick: showiframeOrJsChange,
								  value: "iframe",
								  defaultChecked: true
								},),
								wpCreateElem("label", {
								  for: "iframeEmbed"
								}, "iFrame")),
								wpCreateElem("span", {
								  class: ""
								},
								wpCreateElem("input", {
								  type: "radio",
								  id: "jsEmbed",
								  name: "embedType",
								  onClick: showiframeOrJsChange,
								  value: "iframe",
								},),
								wpCreateElem("label", {
								  for: "jsEmbed"
								}, "Java Script"))  
								);
		var urlParamsCBDiv = wpCreateElem("div",{
									class: "embedIncldeParamtrs"
								},
								wpCreateElem("div", {class: "cusCheckBox"}, wpCreateElem("input", {
								  type: "checkbox",
								  id: "queryParamsCB",
								  onChange: showOrHideUrlParamsDiv,
								}), wpCreateElem("label", {
								  for: "queryParamsCB"
								}, "Add URL params")),
								wpCreateElem("span",null,"Include parameters to prefill forms and add referrers to track sources"));
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
							      wpCreateElem("label", null, "Parameter Value ")
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
							  	wpCreateElem("div",{
							  		class: "intArrow"
							  	},
							  	wpCreateElem("em",{class: "arrowImg"})),
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
								  class: "cusCheckBox",
								  onChange : disableOrEnableHeight ,
								  style: { display:'none'}
								}, wpCreateElem("input", {
								  type: "checkbox",
								  id: "autoHeightCB",
								}), wpCreateElem("label", {
								  for: "autoHeightCB"
								}, "Set form height automatically."));
		var embedActionDiv = wpCreateElem("div",
								{
    								id: "embedActionsDiv",
    								//class: "zf-WpEmbeddedWrap",
									style: { display:'none'}
  								},
  								wpCreateElem("div",
  								{
  									class: "embedFormUsing",
  								},
  								wpCreateElem("label", null, "Embed form using", ),
								embedTypeDIv,
								autoHeightCBDiv,
  								wpCreateElem("div",
      									{
      										class: "embedFormInputField"
      									},
      									wpCreateElem("span",
        									{
        										
        									},
        									wpCreateElem("label", null, "Width "),
        									wpCreateElem("input", 
					          					{
									            	type: "text",
									            	id: "formWidth",
									            	placeholder: "100%"
					          					}
					        				)
        								),
					      				wpCreateElem("span",
					        				{
					        					
					        				},
					        				wpCreateElem("label", null, "Height "),
					        				wpCreateElem("input", 
					        					{
					            					type: "text",
					            					id: "formHeight",
					            					placeholder: "600px"
					          					}
					          				)
					        			),
					      				//wpCreateElem("div",{class:"clearBoth"},null)
    								)),
									urlParamsCBDiv,
									urlParamDiv,
								   wpCreateElem("div",{
								   		class: "zf-wb-errorCont",
								   		id: "paramError",
								    	style: {display:'none'}
								   },wpCreateElem("p", null,"Parameters should contain only alphanumeric characters, underscore, and hyphen.")),
    								wpCreateElem("div",{class:"zf-wb-Fotter"},wpCreateElem("button",{class:"zf-wb-blue", onClick: zf_block_embed},"Embed"))
							);
  		return wpCreateElem("div", 
	  				blockProps,
	  				wpCreateElem("link", 
	  					{
	  						href: zohoFormsBlock.blockCSS,
	  						rel: "stylesheet"
	  					}
	  				),
	  				wpCreateElem("input",{
	  					id:"embedCatogory",
	  					type:"hidden",
	  					value:"formPerma"
	  				}),
					wpCreateElem("div",
			  				{
			    				id: "zfHomeDiv",
							    
							    class: "zf-wb-signWrapper"
			  				},
			  				wpCreateElem("p", null,"You can choose a form from your Zoho forms account or enter your form's permalink URL and embed it."),
			  				wpCreateElem("button", { class:"zf-wb-blue", onClick: chooseForm },"Access Zoho Forms"),
			  				wpCreateElem("label",null,"or"),
			  				wpCreateElem("a",{onClick: embedPerma},"Embed using permalink")
					), 	
	  				permaLinkEmbedDiv,
	  				chooseZFormDiv,
	  				embedActionDiv,
	  				wpCreateElem("div", { id: "blockEditShortCodeDiv"} )
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