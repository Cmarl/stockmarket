/* global Firebase:true */
'use strict';

$(document).ready(init);

var root, user, balance, symbol, buyAmnt, portfolios;

function init(){
  root = new Firebase('https://stockmarket-app.firebaseio.com/');
  user = root.child('user');
  user.on('value',updateName);
  $('#update').click(newUser);
  balance = root.child('balance');
  balance.on('value',updateBalance);
  portfolios = root.child('portfolios');
  portfolios.on('child_added',addPortfolio);
  portfolios.on('child_changed',portfolioChanged);
  $('#createPortfolio').click(createPortfolio);
  $('#buyStock').on('click','#buy',setSymbol);
  $('#buy').click(getQuote);
}

function newUser(){
  var name = $('#name').val();
  var cash = $('#cash').val();
  user.set(name);
  balance.set(cash);
  $('#input').hide();
}

function updateName(snapshot){
  var name = snapshot.val();
  $('#welcome').text(name);

}

function updateBalance(snapshot){
  var bal = snapshot.val();
  $('#showBalance').text(bal);
}

function addPortfolio(snapshot){
  //var portfolio = snapshot.val();
  var key = snapshot.val();
  console.log(snapshot.key())
  var portName = key.name;
  var $option = '<option class="portfolio" value="' + snapshot.key() + '">'+portName+'</option>';
  $('.portfolioList').append($option);
  var $div = $('<div class="'+portName+'">');

  $div.addClass('portfolio').append('<h2>'+ portName );
  $('#portfolioViewer').append($div);
}

function createPortfolio(){
  var portName = $('#portName').val();
  var portfolio = { name: portName };
  portfolios.push(portfolio,function(){
    console.log('create', portfolio.name);
  });
}

function setSymbol(){
  symbol = $('#symbol').val();
  buyAmnt = $('#buyAmnt').val();
}

function portfolioChanged(snapshot){
  var portfolio = snapshot.key();

  

  // console.log(portfolio);
  // console.log(portfolios.child(portfolio));
}

// function updatePortfolio(snapshot){
//   var port = snapshot.val();
//
//   var symbol = snapshot.symbol;
//   var amount = snapshot.amount;
//   var position = snapshot.position;
//
//   var $stock = $('<div class="stock"></div>');
//   var $sym = $('<h3>'+symbol+': '+amount+'</h3>');
//   var $position = $('<h3 class="position"> Position: $'+position+'</h3>');
//   $stock.append($sym);
//   $stock.append($position);
//   $(port).append($stock);
//
// }

function getQuote(){
  var symbol = $('#symbol').val().toUpperCase();
  var url = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=' + symbol + '&callback=?';
  $.getJSON(url, function(response){
    var price = response.LastPrice;
    var amount = $('#buyAmnt').val();
    //var $sym = $('<h3>'+ symbol + ': ' + amnt + '</h3>');
    //var $position = $('<h3 class="position"> Position: $' +(price * amnt).toFixed(2) + '</h3>');
    //var $selected = '.'+$('.portfolioList').val();
    //var $stock = $('<div class="stock"></div>');
    var portfolio = portfolios.child($('.portfolioList').val());
    portfolio.push({
                    symbol: symbol,
                    amount: amount,
                    position: ((price * amount).toFixed(2))
                   });
    //$stock.append($sym);
    //$stock.append($position);
    //$($selected).append($stock);
    $('#showBalance').text(($('#showBalance').text() - price));
  });
}
