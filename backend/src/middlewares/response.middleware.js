const responseMiddleware = (req, res, next) => {
  res.success = (data = null, message = 'Success', pagination = undefined, metadata = undefined) => {
    return res.status(res.statusCode || 200).json({
      status: 'success',
      message,
      data,
      metadata,
      pagination,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  };

  next();
};

module.exports = responseMiddleware;
