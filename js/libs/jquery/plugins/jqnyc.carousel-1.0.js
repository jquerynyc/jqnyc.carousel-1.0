/* jQuery Plugin Pattern 2.1
 * Author: Milan Adamovsky
 *
 * This pattern allows you to write jQuery plugins a lot faster, more consistently,
 * and less error prone.  Furthermore it allows namespacing, OOP integration, along
 * with other technical benefits.  
 *
 * There are two "global" (but local) helper methods available throughout each plugin
 * and they are:
 *
 *   getPluginClass() 
 *   getPluginName()
 *
 * The getPluginClass() returns the definition of the entire plugin code.  Usually 
 * this is not needed by the plugin author (you), but in the rare event you would
 * need it, here it is.  It is used internally by the plugin pattern.
 *
 * The getPluginName() returns the name of the plugin's jQuery namespace as defined
 * by the initPlugin() method (which is something you, the author, defines).
 *
 * Attention to JSLint users: this code will not pass due to some advanced paradigms
 * in use, though efforts have been taken to minimize these.  Priority was given to
 * functionality and syntax correctness so that YUI Compressor can properly minify
 * the code.
 */ 

(function($, config)
  {
   var jqInit = $.fn.init,
       jqInitObject;

   function _ (fn)      // local function that facilitates chainability
    {
     return function (args)
             {
              debugger;
              return this.prototype.chain(function () 
                                          { 
                                           fn.call(this, args); 
                                          }); 
             };
    }
       
   // getConfig - always used to contain class/plugin arguments
   function getConfig()
    {
     return undefined;       // we define this via setConfig()
    }

   // initConfig - sets default values via jQuery's extend()
   function initConfig(args)
    { 
     setConfig($.extend({
                         chainable : true,     // false - this allows us to do something like $(...).plugin(args).method()
                                               //         this returns the object as the output
                                               // true  - otherwise, by default, it will assume jQuery native functionality of chainability
                                               //         this returns what jQuery expects for chaining
                         properties : {}       // any properties that you want to be passed to the plugin.
                        }, 
                        args));
    }
   
   function jQuerify(args)  
    {
     var classCode, 
         classObject,  
         pluginName = config.name,
         pluginObject;
     
     console.log('ARGS: ', args);
     if (typeof args === 'function')
      {
       //debugger;
       console && console.log("Called as a function");
       return jqInitObject.each(args);  // handles chaining of method
      }
     else
      {
       console && console.log("Called as a property");
       initConfig(args);

       classCode = getPluginClass(config.version),         // get a reference to the plugin OOP code
       classObject = new classCode(args);                   // instantiate plugin Class (which is OOP)
       pluginObject = $.fn[pluginName] = classObject.chain;
       $.extend(pluginObject.prototype, classObject); // augment your plugin's prototype with your object
       $.extend(pluginObject, classObject);            // same here.
                
       console && console.log(" > args: ", args);
       console && console.log(" > chainable: ", getConfig().chainable);

       return getConfig().chainable       // checks for chaining in main plugin
               ? jqInitObject             // returns chainability hook
               : $.fn[getPluginName()];   // returns OOP object hook
                                          // getPluginName() is defined in initPlugin()
      }
    }
   
   function getPluginClass(pluginVersion)
    {
     return function (args)
             {
              this.chain = jQuerify;
              
              // Version - directly exposed to be access via $(...).plugin.version
              this.version = pluginVersion;
              
              // Public Methods - wrappers containing a reference to the actual function 
              this.render = _(renderThis);   // chainable method
             // this.someMethodB = someMethodB;    // non-chainable method
        
              if (typeof args.init === "function")
               args.init.call(this, args);
         
              function renderThis()
               {
                console.log('render this');
               }
              
              initConfig(args);
              
              return this;
             };
    }
   
       
   function initPlugin(args)
    {
     var classCode,
         classObject,
         error,
         eventPool = args.pool,
         pluginName = args.name,
         pluginObject,
         pluginVersion = args.version;
                      
     console && console.log("Initializing " + pluginName + " plugin.");                    

     try                                       // meat 
      {
       classCode = getPluginClass(pluginVersion),         // get a reference to the plugin OOP code
       classObject = new classCode({});                   // instantiate plugin Class (which is OOP)
    //   $.fn[getPluginName()] = classObject.rc;          // insert instantiated plugin into jQuery namespace
       pluginObject = $.fn[pluginName] = classObject.chain;
       $.extend(pluginObject.prototype, classObject); // augment your plugin's prototype with your object
       $.extend(pluginObject, classObject);            // same here.

       console && console.log(" > Retrieved class function: " , classCode);    
       console && console.log(" > Instantiated class object: " , classObject);       
       console && console.log("Initialized plugin object: " , pluginObject);

       $.fn.extend({                            // now we overwrite jQuery's internal init() so we
                                                // can intercept the selector and context.
                    init: function( selector, context, rootQuery ) 
                           {
                            jqInitObject = new jqInit(selector, context, rootQuery);
                            
                            return jqInitObject;
                           }
                   });

      }
     catch (error)
      {
       $(eventPool).trigger("error." + pluginName,
                            error);                           // in case something breaks let us know.
      }

    }
    
   // setConfig - always used to set class/plugin arguments, usually used indirectly via initConfig
   function setConfig(args)
    {
     getConfig = function()
                  {
                   return (args);
                  };
    }      
           
   initPlugin({
               "name" : config.name || "unknown",  // plugin name 
               "pool" : config.pool || document,   // event pool
               "version" : config.version || "1.0" // plugin version
              });   
 /*
   initPlugin({
               name : 'carousel'  // plugin name 
              });
   
   //----plugin class -- BEGIN--------
   function getPluginClass()
    {
     return function (args)
      {
       // Version - directly exposed to be access via $(...).plugin.version
       this.version = '1.0';
      
       // Public Methods - wrappers containing a reference to the actual function 
       this.someMethodA = someMethodA;   // non-chainable method
       this.someMethodB = _(someMethodB);    // chainable method
       
       this.rc = jQuerify;       // required plugin pattern code

       // getConfig - always used to contain class/plugin arguments
       function getConfig()
        {
         return undefined;       // we define this via setConfig()
        }
  
       // setConfig - always used to set class/plugin arguments, usually used indirectly via initConfig
       function setConfig(args)
        {
         getConfig = function()
                      {
                       return (args);
                      };
        }      
  
       // initConfig - sets default values via jQuery's extend()
       function initConfig(args)
        { 
         setConfig($.extend({
                             chainable : true,     // false - this allows us to do something like $(...).plugin(args).method()
                                                   //         this returns the object as the output
                                                   // true  - otherwise, by default, it will assume jQuery native functionality of chainability
                                                   //         this returns what jQuery expects for chaining
                             properties : {}       // any properties that you want to be passed to the plugin.
                            }, args));
         return (this);
        }
  
       //---[BEGIN YOUR CODE below]-------
       //   [Class methods / properties]

       function someMethodA(args)
        {
         alert('This is our non-chainable method!');

         return (this);    // we return this to allow classic OOP
        }
        
       function someMethodB(args)
        {
         alert('This is our chainable method!');

         // we don't have to return anything since the _() takes
         // care of chainability. 
        }
     
                
       // initConfig - gets called to set defaults for plugin
       initConfig(args);   // Pattern code - usually just copy/paste
       
       // we put our logic after the method definitions to keep JSLint a
       // little happier.
        
       //---[END YOUR CODE above]----

       function _ (fn)      // local function that facilitates chainability
        {
         return function (args)
                 {
                  return this.prototype.rc(function () 
                                            { 
                                             fn.call(this, args); 
                                            }); 
                 };
        }
        
       function jQuerify(args)  
        {
         if (typeof args == 'function')
          {
           return $.fn.curReturn.each(args);  // handles chaining of method
          }
         else
          {
           initConfig(args);
           
           return getConfig().chainable       // checks for chaining in main plugin
                   ? $.fn.curReturn           // returns chainability hook
                   : $.fn[getPluginName()];   // returns OOP object hook
                                              // getPluginName() is defined in initPlugin()
          }
        };
      };
    }

   if ($.fn.curReturn === undefined)          // checks if a plugin has already loaded environment
    {
     $.fn.extend({                            // if not then it extends jQuery object.
                  curReturn: null,            // declares placeholder
                  jQueryInit: jQuery.fn.init  // saves original jQuery init method
                 });
      
     $.fn.extend({                            // now we overwrite jQuery's internal init() so we
                                              // can intercept the selector and context.
                  init: function( selector, context ) 
                         {
                          return jQuery.fn.curReturn = new jQuery.fn.jQueryInit(selector, context);
                         }
                 });
    }
        
   function initPlugin(args)
    {  
     getPluginName = function()
                       {
                        return args.name;    // sets getPluginName() to return jQuery plugin name
                       };
                       
//     console && console.log(["Initialize", args.name, "plugin."].join(' '));                    

     try                                       // meat 
      {
       var classCode = getPluginClass(),       // get a reference to the plugin OOP code
       _p = new classCode({});                 // instantiate plugin Class (which is OOP)
       $.fn[getPluginName()] = _p.rc;          // insert instantiated plugin into jQuery namespace
       $.extend($.fn[getPluginName()].prototype,_p);  // augment jQuery internals
       $.extend($.fn[getPluginName()],_p);            // same here.
      }
     catch (error)
      {
       alert(error);                           // in case something breaks let us know.
      }

    }
   */
  })(jQuery, 
     {      
      "name" : "carousel",
      "pool" : document,
      "version" : "1.0"
     });