

var histogram;
var scattermatrix;
var count=0;
var currentnumdim=0;
var dim=16;
var dimperimage = 4;
var info;



function cb_updatescatterplot(datatile){

  firsttime = eval(datatile['firsttime']);
  datatile = datatile[0]

  var image = new Image();
  image.src="data:image/png;base64,"+datatile['2']['data'];
  var that = this;
  image.onload = function(){

    scattermatrix.update(
      datatile['2']['numrelations'],
      image,
      datatile['2']['width'],
      datatile['2']['numdim'],0,4,
      datatile['2']['numbin']
    );

    //diff:
    if(firsttime){
      scattermatrix.addscatter(0, 0, 0, 0);
      scattermatrix.draw();
      adddimension();
    }

    image = new Image();
    image.src="data:image/png;base64,"+datatile['4']['data'];
    var that = this;
    image.onload = function(){
      scattermatrix.update(
        datatile['4']['numrelations'],
        image, datatile['4']['width'],
        datatile['4']['numdim'], 0,4,
        datatile['4']['numbin']
      );
      redrawscatterplots();

      image = new Image();
      image.src="data:image/png;base64,"+datatile['histogram']['data'];
      image.onload = function(){

        histogram.update(
          image,
          datatile['histogram']['width'],
          datatile['histogram']['height'],
          datatile['4']['numdim'],
          datatile['4']['numbin'],
          datatile['histogram']['numbin']
        );
        histogram.draw(scattermatrix.getSelection());

        //diff
        if(firsttime){
          var onchange = function(){
            histogram.setDim($('#histogramdim').val());
            histogram.draw(scattermatrix.getSelection());
          };
          var dropdown = createdropdown('histogramdim', onchange);
          document.getElementById('histogramdropdowndim').appendChild(dropdown);
        }

      }
    }
  } 
}

/*
function updatescatterplot(datatile){

  console.log(datatile['firsttime']);

  datatile = datatile[0];

  var image = new Image();
  image.src="data:image/png;base64,"+datatile['2']['data'];
  var that = this;
  image.onload = function(){

    scattermatrix.update(
      datatile['2']['numrelations'],
      image,
      datatile['2']['width'],
      datatile['2']['numdim'],0,4,
      datatile['2']['numbin']
    );

    image = new Image();
    image.src="data:image/png;base64,"+datatile['4']['data'];
    var that = this;
    image.onload = function(){
      scattermatrix.update(
        datatile['4']['numrelations'],
        image, datatile['4']['width'],
        datatile['4']['numdim'], 0,4,
        datatile['4']['numbin']
      );
      redrawscatterplots();

      image = new Image();
      image.src="data:image/png;base64,"+datatile['histogram']['data'];
      image.onload = function(){

        histogram.update(
          image,
          datatile['histogram']['width'],
          datatile['histogram']['height'],
          datatile['4']['numdim'],
          datatile['4']['numbin'],
          datatile['histogram']['numbin']
        );
        histogram.draw(scattermatrix.getSelection());

      }
    }
  } 

}
*/


function createdropdown(id, onchange){

  //TODO: replace with jquery
  var dropdown = document.createElement("select");
  dropdown.id = id;
  dropdown.className = 'dropdownmenu';
  dropdown.onchange = onchange;

  for(var i=0; i<scattermatrix.numdim[2]; i++){
    var option=document.createElement("option");
    option.text = i;
    dropdown.add(option, null);
  }

  return dropdown;
}

function redrawscatterplots(){

  for(var i = 0; i<currentnumdim; i++){
    for(var j = 0; j<currentnumdim; j++){
      scattermatrix.addscatter(i, j, parseInt($('#dropdownmenu_dim1_'+i).val()), parseInt($('#dropdownmenu_dim2_'+j).val()));
      scattermatrix.draw();
    }
  }

}

function changeNumBin(){
  scattermatrix.reset();
  count = 0;
  //$.post('/data', {'numbinscatter' : $('#numbinscatter').val(), 'numbinhistogram': $('#numbinhistogram').val()}, updatescatterplot);
  //TODO: numbinhistogram with a different bin count
  $.post(
    '/data',
      {
        'firsttime' : false,
        'numbinscatter' : $('#numbinscatter').val(),
        'numbinhistogram': $('#numbinscatter').val(),
        'dimperimage': dimperimage
      },
    cb_updatescatterplot
  );
}

function addscatterplot(){
  scattermatrix.reset();
  count = 0;
  adddimension();
  redrawscatterplots();
}

function removescatterplot(){

  scattermatrix.reset();
  count = 0;
  removedimension();
  redrawscatterplots();

}

function adddimension(){

  //TODO: replace with jquery

  var onchange = function(){
    scattermatrix.reset();
    count = 0;
    redrawscatterplots();
  };

  //horizontal
  var dropdown = createdropdown('dropdownmenu_dim1_'+currentnumdim, onchange);
  dropdown.value = currentnumdim;
  var table = document.getElementById('scatterplotdim1');
  row = table.rows[0];
  var cell = row.appendChild(document.createElement("td"));
  //cell.innerHTML = currentnumdim;
  cell.appendChild(dropdown);


  //vertical
  dropdown = createdropdown('dropdownmenu_dim2_'+currentnumdim, onchange);
  dropdown.value = currentnumdim;
  table = document.getElementById('scatterplotdim2');
  row = table.insertRow(0);
  cell = row.appendChild(document.createElement("td"));
  //cell.innerHTML = currentnumdim;
  cell.appendChild(dropdown);


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

function initialize(){
  /*
  scattermatrix = new scattergl(document.getElementById('scatterplotmatrix'));
  for(var i = 0; i<8; i++){
    for(var j = 0; j<8; j++){
      var postdata = {'dim1': i, 'dim2' : j};
      
      $.post('/data', postdata, createscatterplot);
    }
  }
  */
  //scattermatrix = new scattergl(document.getElementById('scatterplotmatrix'));
  //$.post('/data', {'dim1': 0, 'dim2' : 0}, createscatterplot);
  scattermatrix = new scattergl(document.getElementById('scatterplotmatrix'));
  histogram = new Histogram($('#histogram'), $('#histogramdiv'));
  scattermatrix.setHistogram(histogram);
  
  $.post(
    '/data',
      {
        'firsttime' : true,
        'numbinscatter' : 2,
        'numbinhistogram': 2,
        'dimperimage' : dimperimage
      },
    cb_updatescatterplot
  );

}


window.onload = initialize;