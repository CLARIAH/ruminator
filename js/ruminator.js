
rum = {}; 
indent = 3;

$(document).ready(function(){


	$('#left').click(function(){
		
		var jsondata = $('#cowjson').val();
		if(jsondata != ""){
			rum = JSON.parse(jsondata);
		}
		updateForm();
		return false;
	});

	$('#right').click(function(){
		
		updateJson();
		var prettified = JSON.stringify(rum, null, indent);
		$('#cowjson').val(prettified);
		
		return false;
	});

	$('#prettify').click(function(){

		var cowjson = $('#cowjson').val();
		var prettified = formatJSON(cowjson,indent);
		$('#cowjson').val(prettified);

	});



	$("#left img").hover(function(){
		$(this).attr('src','/img/cow-left.png');
	},
	function(){
		$(this).attr('src','/img/cow-left-light.png');	
	});

	$("#right img").hover(function(){
		$(this).attr('src','/img/cow-right.png');
	},
	function(){
		$(this).attr('src','/img/cow-right-light.png');	
	});

	$('#to-dataset').click(function(){
		showTab('#dataset');
	});

	$('#to-columns').click(function(){
		showTab('#columncontainer');
	});

	$('#to-help').click(function(){
		showTab('#help');
	});

	$('#to-context').click(function(){
		showTab('#context');
	});

	$('#expand').click(function(){
		$('.columncontent').show();
		return false;
	});

	$('#collapse').click(function(){
		$('.columncontent').hide();
		return false;
	});




	showTab('#columns');

});

function showTab(tab){
	$('.tabcontent').hide();
	$(tab).show();
}

function updateForm(){

	// create columns
	$('#columns').empty();
	var cols = rum.tableSchema.columns;
	$.each(cols, function(index){

		columnBlock = createColumnBlock(this, index);
		columnBlock.appendTo('#columns');
		
	});

	// populate dataset metadata (dialect, publisher, license)
	$('#dataset').empty();
	metadataBlock = createMetadataBlock(rum);
	metadataBlock.appendTo('#dataset');

	// bind some actions
	bindevents();

	// and show columns
	showTab('#columncontainer');
}	


function bindevents(){
	$('.column h3').click(function(){
		$(this).siblings('.columncontent').toggle();
	});

	$('.columncontent select[name="datatype"]').change(function(){
		var datatype = $(this).val();
		if(datatype=="string"){
			$(this).siblings('input[name="lang"]').show();
		}else{
			$(this).siblings('input[name="lang"]').hide();
			$(this).siblings('input[name="lang"]').val('');
		}
	});

	$('.addvirtual').click(function(){
		var regcolumn = $(this).closest('.regular-column');
		var column = $('#vir-col-template .cc').clone();
		column.addClass('column virtual-column').removeClass('cc');
		column.children('.columncontent').css('display','block');
		column.children('h3').click(function(){
			$(this).siblings('.columncontent').toggle();
		});
		column.children('.columncontent').children('select[name="datatype"]').change(function(){
			var datatype = $(this).val();
			if(datatype=="string"){
				$(this).siblings('input[name="lang"]').show();
			}else{
				$(this).siblings('input[name="lang"]').hide();
				$(this).siblings('input[name="lang"]').val('');
			}
		});
		column.children('.columncontent').children('.delvirtual').click(function(){
			var vircolumn = $(this).closest('.virtual-column');
			vircolumn.remove();
			return false;
		});
		column.insertAfter(regcolumn);
		return false;
	});

	$('.delvirtual').click(function(){
		var vircolumn = $(this).closest('.virtual-column');
		vircolumn.remove();
		return false;
	});
}


function updateJson(){

	// columns
	var cols = [];
	$('.column').each(function(){
		var content = $(this).children('.columncontent');
		var originalJSON = content.children('input[name="jsondata"]').val();
		var thiscol = JSON.parse(originalJSON);

		content.children('.attribute').each(function(index){
			var attrvalue = $(this).val();
			if(attrvalue==''){
				delete thiscol[this.name];
			}else{
				thiscol[this.name] = $(this).val();
			}
		});
		
		cols.push(thiscol);
	});
	rum.tableSchema.columns = cols;


	// dataset metadata (dialect, publisher, license)
	rum.dialect.quoteChar = $('#quoteChar').val();
	rum.dialect.delimiter = $('#delimiter').val();
	rum.dialect.encoding = $('#encoding').val();
	rum['dc:publisher']['schema:name'] = $('#publisher-name').val();
	rum['dc:publisher']['schema:url']['@id'] = $('#publisher-url').val();

}



function formatJSON(input, indent) {
    if (input.length == 0) {
      	return '';
    }
    else {
		var parsedData = JSON.parse(input);
		return JSON.stringify(parsedData, null, indent);
    }
}

function createColumnBlock(coldata, index){
	if(coldata.virtual==true){
		var column = $('#vir-col-template .cc').clone();
		column.addClass('column virtual-column').removeClass('cc');
		var content = column.children('.columncontent');
	}else{
		var column = $('#reg-col-template .cc').clone();
		column.addClass('column regular-column').removeClass('cc');
		var content = column.children('.columncontent');
		column.children('h3').html(coldata.name);
	}
	content.children('input[name="jsondata"]').val(JSON.stringify(coldata));
	content.children('textarea[name="dc:description"]').html(coldata['dc:description']);
	if ( typeof coldata['datatype'] !== 'undefined'){
		content.children('select[name="datatype"]').val(coldata['datatype']);
		if(coldata['datatype']=='string'){
			content.children('input[name="lang"]').css('display','block');
		}
	}
	$.each(coldata, function(colname){
		content.children('input[name="'+colname+'"]').val(coldata[colname]);
	});

	return column;
}


function createMetadataBlock(cowdata){
	
	var block = $('<div/>', {
	    class: 'metadata'
	});
	$('<h3/>', {
		    text: 'dialect'
	}).appendTo(block);
	$('<input/>', {
	    type: 'text',
	    value: cowdata['dialect']['quoteChar'],
	    class: 'form-control small',
	    id: 'quoteChar',
	    placeholder: 'quote char'
	}).appendTo(block);
	$('<input/>', {
	    type: 'text',
	    value: cowdata['dialect']['delimiter'],
	    class: 'form-control small',
	    id: 'delimiter'
	}).appendTo(block);
	$('<input/>', {
	    type: 'text',
	    value: cowdata['dialect']['encoding'],
	    class: 'form-control small',
	    id: 'encoding'
	}).appendTo(block);
	$('<h3/>', {
		    text: 'publisher'
	}).appendTo(block);
	$('<input/>', {
	    type: 'text',
	    value: cowdata['dc:publisher']['schema:name'],
	    class: 'form-control',
	    id: 'publisher-name'
	}).appendTo(block);
	$('<input/>', {
	    type: 'text',
	    value: cowdata['dc:publisher']['schema:url']['@id'],
	    class: 'form-control',
	    id: 'publisher-url'
	}).appendTo(block);
	$('<h3/>', {
		    text: 'license'
	}).appendTo(block);
	$('<input/>', {
	    type: 'text',
	    value: cowdata['dc:license']['@id'],
	    class: 'form-control',
	    id: 'license'
	}).appendTo(block);
	
	return block;
}

