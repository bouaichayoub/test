

const index = (req, res) => {
    res.render('index', { title: 'Proxy App' });
}

module.exports = {
    index
}