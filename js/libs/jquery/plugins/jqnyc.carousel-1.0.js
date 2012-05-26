 (function($)
   {
    $.fn.carousel = function( type ) 
                     {                  
                      function rightAction()
                       {
                        alert('right');
                       }
                  
                      function leftAction()
                       {
                        alert('left');
                       }
                  
                      return this.each(function() 
                                        {
                                         var $this = $(this);
                                   
                                         $('.right', 
                                           $this).bind('click',
                                                       rightAction);
                                   
                                         $('.left', 
                                           $this).bind('click',
                                                       leftAction);
                                        });
                  
                    };
   })( jQuery );
