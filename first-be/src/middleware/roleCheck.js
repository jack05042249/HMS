const talentUrlWhiteList = ['/api/allTalents', '/api/getAggregatedTalents', '/api/talent', '/api/talent/:id'];

const roleCheck = (req, res, next) => {
  const userType = req.user.type;
  if (userType === 'talent' && talentUrlWhiteList.includes(req.url)) {
    next();
  } else if (userType === 'admin') {
    next();
  }
  else {
    res.status(401).send('No access');
  }
};

module.exports = { roleCheck };
