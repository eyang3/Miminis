/*
 * GET home page.
 */


exports.index = function(req, res) {
    if (req.session.idx != null) {
        res.cookie('idx', req.session.idx, {
            expires: new Date(Date.now() + 99999999999),
            httpOnly: true
        });
        res.cookie('token', req.session.token, {
            expires: new Date(Date.now() + 99999999999),
            httpOnly: true
        });
        res.cookie('tokenSecret', req.session.tokenSecret, {
            expires: new Date(Date.now() + 99999999999),
            httpOnly: true
        });
    } else if (req.cookies != null) {
        req.session.idx = req.cookies.idx;
        req.session.token = req.cookies.token;
        req.session.tokenSecret = req.cookies.tokenSecret;
    }
    console.log(req.session);
    var tx = 0;
    if (req.session.instagram != null)
        res.cookie('instagram', req.session.instagram, {
            expires: new Date(Date.now() + 99999999999),
            httpOnly: true
        });
    if (req.cookies.instagram != null)
        req.session.instagram = req.cookies.instagram;
    else
        req.session.instagram = null;
    res.render('index', {
        title: 'Express',
        id: req.session.idx,
        id2: req.session.instagram
    });

};
