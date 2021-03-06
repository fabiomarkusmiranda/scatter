/**
 * Creates a calendar as a heat map for given data.
 * Data must be an array of [date, value].
 * @author Cesar Palomo cesarpalomo@gmail.com
 */
var Calendar = function(containerId, data, options) {
  var that = this;
  var monthsExtent = this.getMonthsExtent(data);
  var numberOfWeeks =
    d3.time.weeks(monthsExtent[0], monthsExtent[1]).length + 1;

  var DAYS_IN_A_WEEK = 7;
  var options = options || {};
  var cellWidth = options.cellWidth || 17,
      cellHeight = options.cellHeight || 17,
      paddingX = options.paddingX || 25,
      paddingY = options.paddingY || 20,
      width = numberOfWeeks * cellWidth + paddingX,
      height = cellHeight * DAYS_IN_A_WEEK + paddingY;

  // Formatters.
  var day = d3.time.format('%w'),
      week = d3.time.format('%U'),
      numberFormat = options.numberFormat || d3.format('.2f'),
      dateFormat = d3.time.format('%Y-%m-%d'),
      yearFormat = d3.time.format('%Y'),
      monthFormat = d3.time.format('%b/%Y');


  // Color scale.
  this.colorScale = d3.scale.linear();
  this.extents = d3.extent(data, function(d) { return d[1]; });
  var colors = options.colors || [
    d3.rgb(165,0,38).toString(),
    d3.rgb(215,48,39).toString(),
    d3.rgb(244,109,67).toString(),
    d3.rgb(253,174,97).toString(),
    d3.rgb(254,224,139).toString(),
    d3.rgb(255,255,191).toString(),
    d3.rgb(217,239,139).toString(),
    d3.rgb(166,217,106).toString(),
    d3.rgb(102,189,99).toString(),
    d3.rgb(26,152,80).toString(),
    d3.rgb(0,104,55).toString()];
  this.setupColorScaleDomainAndRange(
    this.colorScale, this.extents, colors, 'white');

  var center = [
    paddingX,
    (height - cellHeight * DAYS_IN_A_WEEK - 1)
  ];

  this.svg = d3.select(containerId).selectAll('svg')
      .data(this.getYearsInData(data))
    .enter().append('svg')
      .attr('width', width)
      .attr('height', height)
      .classed('RdYlGn', true)
    .append('g')
      .attr('transform', 'translate(' + center[0] + ', ' + center[1] + ')');

  // Defines cells for days.
  var week0 = week(monthsExtent[0]);
  var rect = this.svg.selectAll('.day')
      .data(function(d) {
          return d3.time.days(monthsExtent[0], monthsExtent[1]);
      })
    .enter().append('rect')
      .attr('class', 'day')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', function(d) {
        return (week(d) - week0) * cellWidth;
      })
      .attr('y', function(d) {
        return day(d) * cellHeight;
      })
      .datum(dateFormat);

  // Tooltip text for cells.
  rect.append('title')
      .text(function(d) { return d; });

  // Defines path for months' boundaries.
  this.svg.selectAll('.month')
      .data(function(d) {
        return d3.time.months(monthsExtent[0], monthsExtent[1]);
      })
    .enter()
      .append('path')
      .attr('class', 'month')
      .attr('d', monthPath);

  // Legends for months on the top.
  this.svg.selectAll('.monthTitle')
      .data(function(d) {
        return d3.time.months(monthsExtent[0], monthsExtent[1]);
      })
    .enter()
      .append('text')
      .classed('monthTitle', true)
      .attr('x', function(d) {
        var thisMonth = d.getMonth();
        var nextMonthDate = new Date(2013, thisMonth + 1, 1);
        var middleMonth = 0.5 * (+week(nextMonthDate) + (+week(d)));
        return (middleMonth - week0) * cellWidth;
      })
      .attr('y', '-5')
      .text(function(d) { return monthFormat(d); });

  // Legends for days of week on the left.
  var daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  this.svg.selectAll('.dayOfWeekTitle').data(daysOfWeek)
    .enter()
      .append('text')
      .classed('dayOfWeekTitle', true)
      .attr('x', -paddingX)
      .attr('y', function(d, i) { return cellHeight * (0.7 + i); } )
      .text(function(d) { return d; });

  this.nestedData = d3.nest()
    .key(function(d) {
      var date = d[0];
      return dateFormat(date);
    })
    .rollup(function(d) {
      var entry = d[0];
      var value = entry[1];
      return value;
    })
    .map(data);

  var cellTextFormatter = options.cellTextFormatter ||
    function(date, value) {
      return date + ': ' + numberformat(value);
    };

  rect.filter(function(date) {
      // TODO Maybe should not filter, but apply to all dates.
      return date in that.nestedData;
    })
    .style('fill-opacity', '1')
    .style('fill', function(date) {
      var value = that.nestedData[date];
      var color = that.colorScale(value);
      if (color == '#NaNNaNNaN') {
        console.log('wrong color for [' + date + '] = ' + value);
        return 'white';
      }
      return color; 
    })
    .select('title')
    .text(function(date) {
      return cellTextFormatter(date, that.nestedData[date]);
    });

  // Mouse events.
  rect.on('mouseover', function(date, i) {
      if (options.onMouseOver) {
        var value = date in that.nestedData ? that.nestedData[date] : 0;
        options.onMouseOver(date, value);
      }
    })
    .on('click', function(date, i) {
      if (options.onClick) {
        var value = date in that.nestedData ? that.nestedData[date] : 0;
        options.onClick(date, value);
      }
    })
    .on('mouseout', function(date, i) {
      if (options.onMouseOut) {
        var value = date in that.nestedData ? that.nestedData[date] : 0;
        options.onMouseOut(date, value);
      }
  });

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0) - week0,
        d1 = +day(t1), w1 = +week(t1) - week0;
    return 'M' + (w0 + 1) * cellWidth + ',' + d0 * cellHeight
        + 'H' + w0 * cellWidth + 'V' + DAYS_IN_A_WEEK * cellHeight
        + 'H' + w1 * cellWidth + 'V' + (d1 + 1) * cellHeight
        + 'H' + (w1 + 1) * cellWidth + 'V' + 0
        + 'H' + (w0 + 1) * cellWidth + 'Z';
  }
};

/**
 * Returns an array with integers for years present in data.
 */
Calendar.prototype.getYearsInData = function(data) {
  // Sorts appearing years in data.
  var yearFormat = d3.time.format('%Y');
  var sortedYears = data.map(function (d) {
    return d[0].getFullYear(); 
  }).sort();

  // Returns unique years.
  var years = {};
  var uniqueYears = [];
  for (var i in sortedYears) {
    var year = sortedYears[i];
    if (!(year in years)) {
      uniqueYears.push(year);
      years[year] = 1;
    }
  }
  return uniqueYears;
};


/**
 * Returns an array with date interval that contains all
 * months present in data. E.g., if data contains dates
 * 2013-01-07 and 2013-07-15, returns date interval
 * [2013-01-01, 2013-08-01].
 */
Calendar.prototype.getMonthsExtent = function(data) {
  var extents = d3.extent(data, function(d) { return d[0]; });
  var firstMonth = +extents[0].getMonth();
  var firstYear = +extents[0].getFullYear();
  var lastMonth = +extents[1].getMonth();
  var lastYear = +extents[1].getFullYear();

  return [
    new Date(firstYear, firstMonth, 1),
    new Date(lastYear, lastMonth + 1, 1)
  ];
};


/**
 * Given array with colors and data extents, set the domain
 * and range for a color scale.
 */
Calendar.prototype.setupColorScaleDomainAndRange = function(
    colorScale, extents, colors) {
  // Create domain with correct number of steps to accomodate colors.
  var step = 1 / (colors.length - 1);
  var domain = d3.range(colors.length).map(function (i) {
    return extents[0] + i * step * (extents[1] - extents[0]);
  });

  colorScale.domain(domain).range(colors);
};


/**
 * Applies color scale to calendar.
 * @param colorScale {Array<number>} array with strings of html colors
 * to be applied in the domain 0..1.
 */
Calendar.prototype.setColorScale = function(colors) {
  // Sets up color scale and redraws calendar.
  this.setupColorScaleDomainAndRange(
    this.colorScale, this.extents, colors);

  var that = this;
  this.svg.selectAll('.day')
    .filter(function(date) {
      return date in that.nestedData;
    })
    .style('fill', function(date) {
      var value = that.nestedData[date];
      return that.colorScale(value);
    });
};
