/**
 * Meta Pixel, shared by every page on this site including /holiday.
 *
 * THE PIXEL ID IS SET IN ONE PLACE: the constant directly below. Every page
 * loads this one file, so there is no second copy to forget when it changes.
 *
 * The pixel ID is public by design; it ships in the page source of every site
 * that runs a pixel. The Conversions API ACCESS TOKEN is a different thing and
 * must never appear in any file served to a browser. It lives in
 * META_CAPI_TOKEN on the RevMetric server, which sends the server side half.
 *
 * Leave the id empty and nothing happens at all: no fbq, no request to
 * connect.facebook.net, no cookies. That is the correct behaviour until there
 * is a real pixel to fire at.
 */
(function () {
  var META_PIXEL_ID = '';

  /**
   * A per-action id shared with RevMetric's server side event, so Meta collapses
   * the browser copy and the server copy into ONE conversion. Without it the
   * same lead is counted twice and every number the client sees is inflated.
   */
  window.wwcEventId = function (prefix) {
    var r = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Date.now()) + '-' + Math.random().toString(16).slice(2);
    return prefix + '_' + r;
  };

  /** Read a cookie the pixel set, so the server copy can match the same person. */
  window.wwcCookie = function (name) {
    try {
      var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return m ? decodeURIComponent(m[2]) : null;
    } catch (e) {
      return null;
    }
  };

  if (!META_PIXEL_ID) return;

  /* Meta's standard loader, unmodified. */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');

  /**
   * Tap to call fires Contact, not Lead.
   *
   * The tap is intent, not a conversion: plenty of taps never become a
   * connected call. The real Lead is fired server side by RevMetric when the
   * call actually connects, with the caller's own number attached as a match
   * key. Firing Lead here as well would double count every call.
   */
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a[href^="tel:"], [data-call]') : null;
    if (!el) return;
    try {
      fbq('track', 'Contact', { contact_method: 'phone' }, { eventID: window.wwcEventId('tap') });
    } catch (err) {}
  });
})();
