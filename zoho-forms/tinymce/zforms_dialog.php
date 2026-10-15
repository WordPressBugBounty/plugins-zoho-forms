<?php

require_once dirname(__FILE__).'/../zforms_config.php';

?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
    <head>
        
		<title>Zoho Forms</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<script language="javascript" type="text/javascript" src="<?php echo get_option('siteurl') ?>/wp-includes/js/tinymce/tiny_mce_popup.js"></script>
		<script language="javascript" type="text/javascript" src="<?php echo get_option('siteurl') ?>/wp-includes/js/tinymce/utils/mctabs.js"></script>
		<script language="javascript" type="text/javascript" src="<?php echo get_option('siteurl') ?>/wp-includes/js/tinymce/utils/form_utils.js"></script>
		<script type="text/javascript" src="jquery.js"></script>
		<script type="text/javascript" src="../lib/select2/select2.min.js"></script>
		<script language="javascript" type="text/javascript" src="zforms_dailog.js"></script> 
		<!-- <link href="zforms_dailog.css" rel="stylesheet"> -->
		<link href="../lib/select2/select2.min.css" rel="stylesheet">
		<link href="../zohoforms-block.css" rel="stylesheet">
		<link href="zforms_newdialog.css" rel="stylesheet">
    </head>
    <body style="background: rgba(0,0,0,0.7);">
	
		<div class="zf-WpPopupContainer zf-wb-containerWrapper">
		<div class="zf-WpMainWrap">

			<input id="zf_embedCatogory" type="hidden" value="formPerma">
            <div class="connFormCont">
				<div>
					<!-- <div class="connFormHeader">
						<i>
							<img src="../images/zohoforms.png" alt="">
						</i>
						<h4>Connect Your Form</h4>
					</div> -->
					<div class="customAddMapping">
						<a id="chooseFormStep" class="is-selected">
							<span elname="stepNumber">1</span>
							<span elname="tickIcon" style="display: none;">
								<img src="../images/completed.png" alt="">
							</span>
							<em>Choose Form</em>
						</a>
						<a id="configureEmbedStep">
							<span elname="stepNumber">2</span>
							<span elname="tickIcon" style="display: none;">
								<img src="../images/completed.png" alt="">
							</span>
							<em>Embed Settings</em>
						</a>
					</div>
				</div>
			<div id="zf_tiny_homeDiv" class="connFormInnCont">
				<div class="zf-wb-signWrapper zconnectMainCont">
					<h2>Choose a way to embed your form</h2>
					<div class="accCardCont">
						<div id="accessZohoFormsCard" class="accConectCard" onclick="selectConnectionCard(this);">
							<i>
								<img src="../images/access-form.png" alt="">
							</i>
							<div class="accCardRight">
							<h4>Access Zoho Forms</h4>
							<p>Sign in to Zoho Forms and choose a form.</p>
							</div>
							
						</div>
						<div id="embedUsingPermalinkCard" class="accConectCard" onclick="selectConnectionCard(this);">
							<i>
								<img src="../images/icon-link.png" alt="">
							</i>
							<div class="accCardRight">
							<h4>Use a Permalink</h4>
							<p>Embed a form using its permalink URL.</p>
							</div>
							
						</div>
					</div>
				</div>
				<div class="connFormFooter">
					<button class="greenBtnNew" onclick="proceedFromHome();">Next</button>
				</div>
			</div>

			<div class="zf-wb-outerWrapper" id="chooseFormDiv" style="display: none;">
				<div id="loadingDiv" class="zf-wb-loading" style="display: none;">
					<p>loading</p>
					<div class="zf-wb-spinner">
						<div class="bounce1"></div>
						<div class="bounce2"></div>
						<div class="bounce3"></div>
					</div>
				</div>
				<div id="zDomaindiv" class="connFormInnCont">
					<div class="zf-wb-innerWrapper zconnectMainCont">
						<label>Select the domain your Zoho account is registered on. <em>*</em></label>
						<div class="zf-wb-dropWrapper">
							<select id="zf_domain" onchange="hideDomainSelctError();">
								<option value="-select-">-Select-</option>
								<option value=".com">zoho.com</option>
								<option value=".eu">zoho.eu</option>
								<option value=".com.cn">zoho.com.cn</option>
								<option value=".in">zoho.in</option>
								<option value=".com.au">zoho.com.au</option>
								<option value=".jp">zoho.jp</option>
								<option value=".ca">zohocloud.ca</option>
								<option value=".sa">zoho.sa</option>
							</select>
						</div>
						<p id="domainErr" style="display: none;">Please choose a domain.</p>
					</div>
					<div class="connFormFooter">
						<button onclick="goToHome();">Back</button>
						<button class="greenBtnNew" onclick="proceedToSelectFormOnTinyMce();">
							<em id="connectLoadingImgElem" class="newBtnLoader" style="display: none;"></em>Connect
						</button>
					</div>
				</div>
				<div id="zfRefreshDiv" class="refreshCont" style="display: none;">
					<img src="../images/refresh-form.png" alt="">
					<h3>Sign in on the Zoho page, then come back and refresh to load your forms.</h3>
					<div class="refFormFooter">
						<button onclick="goToHome();">Back</button>
						<button class="greenBtnNew" onclick="proceedToSelectFormOnTinyMce();">
							<em id="refreshLoadingImgElem" class="newBtnLoader" style="display: none;"></em>Refresh
						</button>
					</div>
				</div>
				<div id="zfCreateFormDiv" class="refreshCont" style="display: none;">
					<img src="../images/refresh-form.png" alt="">
					<h3>You don't have any forms.</h3>
					<div class="refFormFooter">
						<button class="greenBtnNew" onclick="createForm();">
							<em id="createLoadingImgElem" class="newBtnLoader" style="display: none;"></em>Create a new form
						</button>
					</div>
				</div>
			</div>

			<div id="embedActionsDiv" class="embedActionsDiv" style="display: none;">
				<div class="zconnectMainCont">
					<div id="formSelectionDiv" class="zf-wb-innerWrapper" style="display: none;">
						<div class="zf-wb-innerWrapper" id="selctContainer">
							<label>Choose a form <em>*</em></label>
							<div class="zf-wb-dropWrapper">
								<select id="formname" onchange="showEmbedActionsDiv();hideError();">
									<option value="-Select-">-Select-</option>
								</select>
							</div>
							<p id="formSelectionError" style="display: none;">Please select a form.</p>
						</div>
					</div>
					<div id="permaLinkDiv" class="zf-wb-outerWrapper" style="display: none;">
						<div class="zf-wb-innerWrapper" id="permaContainer">
							<label>Enter your form's permalink URL <em>*</em></label>
							<textarea id="permalink" rows="4" style="width: 100%;" onchange="hideError();"></textarea>
							<p id="permaLinkError" style="display: none;">Please enter your form's permalink URL.</p>
							<span>Need help finding your permalink? <a href="https://help.zoho.com/portal/en/kb/forms/sharing-forms/articles/sharing-a-form-publicly#Sharing_a_link" target="_blank">Learn more</a></span>
						</div>
					</div>
					<div class="embedFormDivider"></div>
					<div class="embedFormUsing">
						<div class="embedFormInputField">
							<span>
								<label>Width </label>
								<div class="embedInputCont">
									<input type="text" id="formWidth" placeholder="100" oninput="allowOnlyNumbers(this);">
									<div class="embedInputPer">
										<i onclick="selectWidthUnit(this);" size_symbol="px">px</i>
										<i class="selected" onclick="selectWidthUnit(this);" size_symbol="%">%</i>
									</div>
								</div>
								
							</span>
							<div id="autoHeightDiv" class="cusCheckBox autoHeightDiv">
								<input type="checkbox" id="autoHeightCB" onchange="disableHeight();">
								<label for="autoHeightCB">Set Custom Height.</label>
							</div>
							<span id="formHeightDiv" style="display: none;">
								<label>Height </label>
								<div class="embedInputCont">
									<input type="text" id="formHeight" class="formHeight" placeholder="600" oninput="allowOnlyNumbers(this);">
									<div class="embedInputPer">
										<i size_symbol="px">px</i>
									</div>
								</div>
								
							</span>
						</div>
					</div>
					<div class="embedFormDivider"></div>
					<div class="embedIncldeParamtrs">
						<div class="cusCheckBox">
							<input type="checkbox" id="queryParamsCB" onchange="showOrHideUrlParamsDiv();">
							<label for="queryParamsCB">Add URL Parameters</label>
						</div>
						<span>Prefill form fields and track where responses come from.</span>
					</div>
					<div id="urlParamsDiv" class="embedParameterValue" style="display: none;">
						<div class="embedField">
							<div class="embedFiel_Col1">
								<label>Parameter Name</label>
							</div>
							<div class="embedFiel_Col2">
								<label>Parameter Value </label>
							</div>
						</div>
						<div class="clearBoth"></div>
						<div elname="paramsDiv"></div>
						<div class="clearBoth"></div>
						<div elname="paramTemplate" class="addparamsWrap" eltype="keyValPair" style="display: none;">
							<div class="addParamaFeld">
								<input type="text" elname="paramKey" maxlength="50" onchange="hideparamError(this);">
							</div>
							<div class="addParamaFeld">
								<input type="text" elname="value" maxlength="50">
							</div>
							<div class="zf-Wp-plusminus">
								<span class="fiedPropPlus" elname="addParam" onclick="addUrlParam(this);"></span>
								<span class="fiedPropMinus" elname="deleteParam" onclick="deleteParam(this);"></span>
							</div>
						</div>
					</div>
					<div class="zf-wb-errorCont" id="paramError" style="display: none;">
						<p>Parameters should contain only alphanumeric characters, underscore, and hyphen.</p>
					</div>
				</div>
				<div class="connFormFooter">
					<button type="button" onclick="goToHome();">Back</button>
					<button type="button" class="greenBtnNew" onclick="zforms_submit();">
						<em elem="loadingImgElem" class="newBtnLoader" style="display: none;"></em>Embed Form
					</button>
				</div>
			</div>
			</div>
		</div>
		</div>
					
	</body>
</html>