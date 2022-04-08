const controller = {

    /**
     * The index method is the default method for the controller.
     * It returns all rows from database
     * 
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */

    index(req, webmax) {
        return webmax.models.UserModel.all()
    }
}

module.exports = controller