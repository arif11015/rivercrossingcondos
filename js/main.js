jQuery(document).ready(function($){
	$('#nav').slicknav({
		allowParentLinks : true,
		label: 'Menu',
	});	
	$('#slider').nivoSlider({
		controlNav:false,
		nextText:'<i class="fa fa-angle-right"></i>',
		prevText:'<i class="fa fa-angle-left"></i>',
		pauseTime:3000,
		manualAdvance: true,   
	});
	 $('.bxslider').bxSlider({
		auto: false,
		nextText:'<i class="fa fa-chevron-right"></i>',
		prevText:'<i class="fa fa-chevron-left"></i>',
		pager: false,
	 });
	 $(".cone_div").append("<img src='img/cone.png' class='ModalCarrot' />");
	 $(".cone_div_right").append("<img src='img/cone-right.png' class='ModalCarrot_right' />");
	 $(".get_intuch_middle").append("<img src='img/triangle.png' class='traingle' />");
	 
	 
	 
	 
	 
	 
	 
	var fenway = new google.maps.LatLng(39.185660,-78.163334);
	$("#test").gmap3({  
	  streetviewpanorama:{
		options:{
		  container: $(document.createElement("div")).addClass("googlemap").insertAfter($("#test")),
		  opts:{
			position: fenway,
			pov: {
			  heading: 34,
			  pitch: 10,
			  zoom: 0
			}
		  }
		}
	  }
	});	 
	 
	 

	 
});
