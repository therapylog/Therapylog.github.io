/* Where the logic meets the app.
 *
 * Everything else under src/logic/ takes what it needs as arguments, so it can
 * be tested without a browser. This file is the exception: the few functions
 * that read the app's own globals (the stored record, the encyclopedia, the
 * old settings) and hand them to the logic. Keep it thin. Anything worth a
 * test belongs in the file it calls.
 */

/* What protocol.js needs to know about the world outside it. */
function tlEnv() {
  return {
    /* A typed compound name -> encyclopedia id, with the app's own matcher. */
    resolve: typeof pkResolve === 'function' ? pkResolve : null,
    /* An encyclopedia id -> formulation: 'oil', 'aq', 'oral', 'susp', 'topical'. */
    medium: function (id) {
      var pk = (typeof TL_PK !== 'undefined' && TL_PK[id]) || null;
      return (pk && pk.medium) || (typeof TL_FORM !== 'undefined' && TL_FORM[id]) || null;
    },
    discreet: typeof discreetReminders === 'function' ? discreetReminders() : false
  };
}

/* The user's protocol, as the model. */
function tlCurrentProtocol() {
  return tlProtocol(gd(), tlEnv());
}
