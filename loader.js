var Discord = require('discord.js');

var glob = require( 'glob' )
  , path = require( 'path' );


glob.sync( './config/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});

glob.sync( './class/*.js' ).forEach( function( file ) {
  require( path.resolve( file ) );
});


