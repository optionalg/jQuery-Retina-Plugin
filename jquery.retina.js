(function($) {
  $.fn.retina = function(options) {
    var settings = { 
      "retina-background" : false,
      "retina-suffix" : "@2x",
      "exclude-image-urls" : []
    };
    if (options) {
      $.extend(settings, options);
    }
    var preload = function(path, callback) {
      var img = new Image();
      img.onload = function() { callback(img) };
      img.src = path;
    };
    var testWithRegexps = function(regexps, str) {
      for(var i=0, len=regexps.length; i<len; i++) {
        if(regexps[i].test(str)) return true;
      }
      return false;
    };
    var testWithStrings = function(strs, str) {
      var regexps = [];
      for(var i=0, len=strs.length; i<len; i++) {
        if(strs[i] instanceof RegExp) regexps.push(strs[i]);
        else regexps.push(new RegExp(strs[i]));
      }
      return testWithRegexps(regexps, str);
    };
    var isExcludeImgUrl = function(url) {
      if(settings["exclude-image-urls"].length) {
        if(testWithStrings(settings["exclude-image-urls"], url)) {
          return true;
        } else return false;
      } else {
        return false;
      }
    };
    var pixelRatioGained = function() {
      return (
        // Webkit
        1 < window.devicePixelRatio
        // Mozilla
        // matchMedia('(-moz-device-pixel-ratio: 1)') returns matches:true
        // even on high-resolution screen Android devices, so using
        // matchMedia('(min-resolution: 240dpi)') here.
          || (window.matchMedia && window.matchMedia('(min-resolution: 240dpi)').matches));
    };
    if (pixelRatioGained()) {
      this.each(function() {
        var element = $(this);
        if (this.tagName.toLowerCase() == "img" && element.attr("src")) {
          if(isExcludeImgUrl(element.attr("src"))) {
            return;
          }
          var path = element.attr("src").replace(/\.(?!.*\.)/, settings["retina-suffix"] +".");
          preload(path, function(img) {
            element.attr("src", img.src);
            var imgHtml = $("<div>").append(element.clone()).remove().html();
            if (!(/(width|height)=["']\d+["']/.test(imgHtml))) {
              element.attr("width", img.width / 2);
            }
          });
        }
        if (settings["retina-background"]) {
          var backgroundImageUrl = element.css("background-image");
          if (/^url\(.*\)$/.test(backgroundImageUrl)) {
            var path = backgroundImageUrl.substring(4, backgroundImageUrl.length - 1).replace(/\.(?!.*\.)/, settings["retina-suffix"] +".");
            if(isExcludeImgUrl(path)) {
              return;
            }
            preload(path, function(img) {
              element.css("background-image", "url(" + img.src + ")");
              if (element.css("background-size") == "auto auto") {
                element.css("background-size", (img.width / 2) + "px auto");
              }
            });
          }
        }
      });
    }
    return this;
  };
})(jQuery);
