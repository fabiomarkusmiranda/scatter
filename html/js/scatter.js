

var histogram;
var scattermatrix;
var map = null;
var canvaslayer = null;
var currentnumdim=0;
var dim=16;
var datapath;
var info;
var colorscale;
var canvas;
var useKDE = true;
var useMap = true;


function cb_receiveDataTile(datatile){

  scattermatrix.numdim = datatile['numdim'];

  if(document.getElementById('dropdownmenu_dim1_0') == null){
    adddimension();
  }

  redrawscatterplots();

  //var firsttime = eval(datatile['firsttime']);
  var numdim = datatile['numdim'];
  var dimperimage = datatile['dimperimage'];
  var numrelations = datatile['numrelations'];

  var image = new Image();
  image.index = datatile['index'];
  image.src="data:image/png;base64,"+datatile['data'];
  image.onload = function(){

    scattermatrix.update(
      datatile['type'],
      image,
      datatile['width'],
      datatile['numentries'],
      datatile['numdim'],
      this.index,
      datatile['numbin'],
      datatile['minvalue'],
      datatile['maxvalue']
    );

    update(map, canvaslayer);
  }

}
/*
function cb_receiveDataTileHistogram(datatile){

  if(document.getElementById('histogramdim') == null){

    histogram = new Histogram($('#histogram'), $('#histogramdiv'));
    scattermatrix.setHistogram(histogram);

    var onchange = function(){
      histogram.setDim($('#histogramdim').val());
      histogram.draw(scattermatrix.getSelection());
    };
    
    var values = new Array(scattermatrix.numdim);
    for(var i=0; i<scattermatrix.numdim; i++)
      values[i] = i;

    var dropdown = createdropdown('histogramdim', onchange);
    document.getElementById('histogramdropdowndim').appendChild(dropdown);
  }

  //histogram
  var image = new Image();
  image.index = datatile['index'];
  image.src="data:image/png;base64,"+datatile['data'];
  image.onload = function(){

    histogram.update(
      image,
      datatile['width'],
      datatile['height'],
      datatile['numdim'],
      datatile['numbin'],
      datatile['numbin']
    );

    update(map, canvaslayer);
  }

}
*/


function redrawscatterplots(){

  for(var i = 0; i<currentnumdim; i++){
    for(var j = 0; j<currentnumdim; j++){

      var dim1 = $('#dropdownmenu_dim1_'+i).val();
      var dim2 = $('#dropdownmenu_dim2_'+j).val();
      var dim3 = $('#dropdownmenu_dim3_'+j).val();

      scattermatrix.addscatter(i, j, dim1, dim2, dim3);
      //update(map, canvaslayer);
    }
  }

  update(map, canvaslayer);
}

function requestDataTiles(){
  for(var i = 0; i<currentnumdim; i++){
    for(var j = 0; j<currentnumdim; j++){

      var dim1 = $('#dropdownmenu_dim1_'+i).val();
      var dim2 = $('#dropdownmenu_dim2_'+j).val();
      var dim3 = $('#dropdownmenu_dim3_'+j).val();

      if(scattermatrix.hasDataTile('count', dim1, dim2) == false){
        $.post(
          '/getCountDataTile',
            {
              'datapath' : datapath,
              'numbinscatter' : $('#numbinscatter').val(),
              'i' : dim1,
              'j' : dim2,
            },
          cb_receiveDataTile
        );
      }

      if(scattermatrix.hasDataTile('index', dim1, dim2) == false){
        $.post(
          '/getIndexDataTile',
            {
              'datapath' : datapath,
              'numbinscatter' : $('#numbinscatter').val(),
              'i' : dim1,
              'j' : dim2,
            },
          cb_receiveDataTile
        );
      }

      if(scattermatrix.hasDataTile('entry', dim1, dim2, dim3) == false){
        $.post(
          '/getEntryDataTile',
            {
              'datapath' : datapath,
              'numbinscatter' : $('#numbinscatter').val(),
              'i' : dim1,
              'j' : dim2,
              'k' : dim3,
            },
          cb_receiveDataTile
        );
      }



      /*
      if(scattermatrix.hasDataTile('2', dim0, dim1) == false){
        $.post(
          '/getDataTile2D',
            {
              'datapath' : datapath,
              'firsttime' : false,
              'numbinscatter' : $('#numbinscatter').val(),
              //'dimperimage' : dimperimage,
              'i' : dim0,
              'j' : dim1,
            },
          cb_receiveDataTile
        );
      }
      
      for(var k = 0; k<currentnumdim; k++){
        for(var l = 0; l<currentnumdim; l++){

          var dim2 = parseInt($('#dropdownmenu_dim1_'+k).val());
          var dim3 = parseInt($('#dropdownmenu_dim2_'+l).val());

          if(scattermatrix.hasDataTile('4', i, j, k, l) == false){
            $.post(
              '/getDataTile4D',
                {
                  'firsttime' : false,
                  'numbinscatter' : $('#numbinscatter').val(),
                  'dimperimage' : dimperimage,
                  'i' : dim0,
                  'j' : dim1,
                  'k' : dim2,
                  'l' : dim3,
                },
              cb_receiveDataTile
            );
          }
        }
      }
      
      if(scattermatrix.hasDataTile('histogram', i, j) == false){
        $.post(
          '/getDataTileHistogram',
            {
              'firsttime' : false,
              'numbinscatter' : $('#numbinscatter').val(),
              'numbinhistogram' : $('#numbinscatter').val(),
              'dimperimage' : dimperimage,
              'i' : dim0,
              'j' : dim1,
            },
          cb_receiveDataTileHistogram
        );
      }
      */

    }
  }
}


function changeNumBin(){
  scattermatrix.reset();
  scattermatrix.resetDataTiles();
  requestDataTiles();
}

function createdropdown(id, values, onchange, className){

  //TODO: replace with jquery
  var dropdown = document.createElement("select");
  dropdown.id = id;
  dropdown.className = className;
  dropdown.onchange = onchange;

  for(var i=0; i<values.length; i++){
    var option=document.createElement("option");
    option.text = values[i];
    dropdown.add(option, null);
  }

  return dropdown;
}

function adddimension(){

  //TODO: replace with jquery

  var onchange = function(){
    scattermatrix.reset();
    requestDataTiles();
    redrawscatterplots();
    update(map, canvaslayer);
  };

  var values = new Array(scattermatrix.numdim);
  for(var i=0; i<scattermatrix.numdim; i++)
    values[i] = i;

  //horizontal
  var dropdown = createdropdown('dropdownmenu_dim1_'+currentnumdim, values, onchange);
  var table = document.getElementById('scatterplotdim1');
  row = table.rows[0];
  var cell = row.appendChild(document.createElement("td"));
  //cell.innerHTML = currentnumdim;
  cell.appendChild(dropdown);
  $('#dropdownmenu_dim1_'+currentnumdim).val(currentnumdim);


  //vertical
  dropdown = createdropdown('dropdownmenu_dim2_'+currentnumdim, values, onchange);
  table = document.getElementById('scatterplotdim2');
  row = table.insertRow(0);
  cell = row.appendChild(document.createElement("td"));
  //cell.innerHTML = currentnumdim;
  cell.appendChild(dropdown);
  $('#dropdownmenu_dim2_'+currentnumdim).val(currentnumdim);

  //third dimension
  dropdown = createdropdown('dropdownmenu_dim3_'+currentnumdim, values, onchange);
  table = document.getElementById('scatterplotdim3');
  row = table.insertRow(0);
  cell = row.appendChild(document.createElement("td"));
  //cell.innerHTML = currentnumdim;
  cell.appendChild(dropdown);
  var option=document.createElement("option");
  option.text = 'density';
  dropdown.add(option, null);
  $('#dropdownmenu_dim3_'+currentnumdim).val('density');
  

  currentnumdim++;

}

function removedimension(){

  if(currentnumdim <= 1)
    return;

  //horizontal
  var table = document.getElementById('scatterplotdim1');
  var row = table.rows[0];
  row.deleteCell(currentnumdim-1);


  //vertical
  table = document.getElementById('scatterplotdim2');
  //table.deleteRow(currentnumdim-1);
  table.deleteRow(0);

  currentnumdim--;

}

function addscatterplot(){
  scattermatrix.reset();
  adddimension();
  requestDataTiles();
  redrawscatterplots();
}

function removescatterplot(){
  scattermatrix.reset();
  removedimension();
  requestDataTiles();
  redrawscatterplots();
}

function changeColorScale(){

  var color = $('#colorbrewer').prop('value');
  var dataclasses = $('#dataclasses').prop('value');
  var colorType = $('#colorType').prop('value');
  var alphaType = $('#alphaType').prop('value');
  var kdetype = $('#kdetype').prop('value');

  var isColorLinear = false;
  var isAlphaLinear = false;
  if(colorType == 'color_linear')
    isColorLinear = true;
  if(alphaType == 'alpha_linear')
    isAlphaLinear = true;

  var fixedAlpha = null;
  if(alphaType == 'alpha_05')
    fixedAlpha = 0.5;
  else if(alphaType == 'alpha_10')
    fixedAlpha = 1.0;
  
  if(colorbrewer[color][dataclasses] != null){
    colorscale.setValues(colorbrewer[color][dataclasses], isColorLinear, isAlphaLinear, fixedAlpha);

    scattermatrix.setColorScale(colorscale.texdata);
    redrawscatterplots();
  }

}

function changeKDEType(){
  scattermatrix.changeKDEType($('#kdetype').prop('value'));
  update(map, canvaslayer);
}

function changeTransparency(){
  changeColorScale();
  update(map, canvaslayer);
}

function changeDataset(value){
  window.location.search = 'datapath='+value;
}

function changeOutliers(){
  var value = $('#outliers').prop('value');
  if(value == 'Outliers')
    scattermatrix.changeOutliers(true);
  else
    scattermatrix.changeOutliers(false);
  update(map, canvaslayer);
}

function changeBandwidth(value){
  scattermatrix.changeBandwidth(value);

  update(map, canvaslayer);

  //update slider and input
  $('#bandwidth').attr('value', value);
  $('#div_bandwidthslider').slider('value', value);
}

function changeZoom(delta){

  if($('#div_zoomslider').slider('value') + delta < 0.0) return;
  if($('#div_zoomslider').slider('value') + delta > 1.0) return;

  scattermatrix.changeZoom(delta);
  update(map, canvaslayer);
  $('#div_zoomslider').slider('value', $('#div_zoomslider').slider('value')+delta);
}

function setZoom(value){
  scattermatrix.setZoom(value);
  update(map, canvaslayer);
  $('#div_zoomslider').slider('value', value);
}

function setOutliersThreshold(value){
  scattermatrix.setOutliersThreshold(value);
  update(map, canvaslayer);
}

function setOutliersSize(value){
  scattermatrix.setOutliersSize(value);
  update(map, canvaslayer);
}

function setContourWidth(value){
  scattermatrix.setContourWidth(value);
  update(map, canvaslayer);
}


function changeWindowSize(){
  scattermatrix.changeWindowSize($('#windowsize').prop('value'));
  update(map, canvaslayer);
}

function changeMeanSize(){
  scattermatrix.changeMeanSize($('#meansize').prop('value'));
  update(map, canvaslayer);
}

function initColorScale(){

  var values = new Array();
  for(var color in colorbrewer)
    values.push(color);


  var dropbox = createdropdown('colorbrewer', values, changeColorScale);
  $('#div_colorbrewer').append(dropbox);

  var dropbox = createdropdown('dataclasses', [3,4,5,6,7,8,9,10,11,12], changeColorScale);
  $('#div_dataclasses').append(dropbox);
  $('#dataclasses').val('9');

  changeColorScale();
}

function resize(){
  scattermatrix.draw(map, canvaslayer);
}

function update(){
  scattermatrix.draw(map, canvaslayer);
}

function initMap(){

  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(37.7750,-122.4183),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'water',
        stylers: [{ color: '#c3cfdd'}]
      },
      {
        featureType: 'poi',
        stylers: [{visibility: 'off'}]
      }
    ]
  };
  var div = document.getElementById('div_map');
  map = new google.maps.Map(div, mapOptions);

  var canvasLayerOptions = {
    map: map,
    resizeHandler: resize,
    animate: false,
    updateHandler: update
  };
  canvaslayer = new CanvasLayer(canvasLayerOptions);

}

function initialize(){

  if(useMap){
    initMap();
    canvas = canvaslayer.canvas;
    $('#div_map').width('800px');
    $('#div_map').height('800px');
    $('#scatterplotmatrix').hide();
  }
  else{
    canvas = document.getElementById('scatterplotmatrix');
    $('#scatterplotmatrix').width('800px');
    $('#scatterplotmatrix').height('800px');
    $('#div_map').hide();
  }

  $( "#div_bandwidthslider" ).slider({
    min: 0.001,
    max: 0.2,
    step: 0.001,
    slide: function( event, ui ) {
      changeBandwidth(ui.value);
    }
  });

  $( "#div_zoomslider" ).slider({
    min: 0.0,
    max: 1.0,
    step: 0.1,
    orientation: "vertical",
    slide: function( event, ui ) {
      setZoom(ui.value);
    }
  });

  $( "#div_outliersslider" ).slider({
    min: 0.0,
    max: 1.0,
    value: 0.5,
    step: 0.01,
    slide: function( event, ui ) {
      setOutliersThreshold(ui.value);
    }
  });

  $( "#div_outlierssizeslider" ).slider({
    min: 2.0,
    max: 16.0,
    value: 4.0,
    step: 1.0,
    slide: function( event, ui ) {
      setOutliersSize(ui.value);
    }
  });

  $( "#div_contourwidthslider" ).slider({
    min: 0.0,
    max: 5.0,
    value: 0.5,
    step: 0.25,
    slide: function( event, ui ) {
      setContourWidth(ui.value);
    }
  });

  //scattermatrix = new ScatterGL(document.getElementById('scatterplotmatrix'));
  scattermatrix = new ScatterGL(canvas);
  colorscale = new ColorScale(document.getElementById('colorscale'));
  initColorScale();

  datapath = window.location.search.substring(window.location.search.indexOf('=')+1);
  if(datapath.length == 0){
    datapath = './data/iris/datatiles/';
    changeDataset(datapath);
  }
  $('#dataset').val(datapath);
  /*
  $.post(
    '/getDataTile2D',
      {
        'datapath' : datapath,
        'firsttime' : false,
        'numbinscatter' : $('#numbinscatter').val(),
        //'dimperimage' : dimperimage,
        'i' : 0,
        'j' : 0,
      },
    cb_receiveDataTile
  );
  */
  
  $.post(
    '/getCountDataTile',
      {
        'datapath' : datapath,
        'numbinscatter' : $('#numbinscatter').val(),
        'i' : 0,
        'j' : 0,
      },
    cb_receiveDataTile
  );

  $.post(
    '/getIndexDataTile',
      {
        'datapath' : datapath,
        'numbinscatter' : $('#numbinscatter').val(),
        'i' : 0,
        'j' : 0,
      },
    cb_receiveDataTile
  );

  $.post(
    '/getEntryDataTile',
      {
        'datapath' : datapath,
        'numbinscatter' : $('#numbinscatter').val(),
        'i' : 0,
        'j' : 0,
        'k' : 'density',
      },
    cb_receiveDataTile
  );
  
  changeBandwidth(0.052);
  changeNumBin();
  changeWindowSize();
  changeMeanSize();
  changeKDEType();
  changeTransparency();
  changeOutliers();

  /*
  $.post(
    '/getDataTile4D',
      {
        'firsttime' : false,
        'numbinscatter' : $('#numbinscatter').val(),
        'dimperimage' : dimperimage,
        'i' : 0,
        'j' : 0,
        'k' : 0,
        'l' : 0,
      },
    cb_receiveDataTile
  );

  $.post(
    '/getDataTileHistogram',
      {
        'firsttime' : false,
        'numbinscatter' : $('#numbinscatter').val(),
        'numbinhistogram' : $('#numbinscatter').val(),
        'dimperimage' : dimperimage,
        'i' : 0,
        'j' : 0,
      },
    cb_receiveDataTileHistogram
  );
  */
}


window.onload = initialize;