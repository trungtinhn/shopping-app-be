const Like = require('../models/Like');

const likeController = {
    // Thêm sản phẩm vào danh sách yêu thích
    addLike: async (req, res) => {
        const { userId, _id } = req.body;

        // Kiểm tra xem userId và _id có tồn tại trong request không
        if (!userId || !_id) {
            return res.status(400).json({ message: 'userId và _id là bắt buộc' });
        }

        try {
            // Tìm kiếm hoặc tạo mới đối tượng Like cho người dùng
            let like = await Like.findOne({ userId });

            if (!like) {
                like = new Like({ userId, productList: [] });
            }

            // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
            if (like.productList.includes(_id)) {
                return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });
            }

            // Thêm sản phẩm vào danh sách yêu thích
            like.productList.push(_id);
            await like.save();

            res.status(200).json({ message: 'Sản phẩm đã được thêm vào danh sách yêu thích' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm sản phẩm vào danh sách yêu thích' });
        }
    },

    // Xóa sản phẩm khỏi danh sách yêu thích
    deleteLike: async (req, res) => {
        const { userId, _id } = req.body;

        // Kiểm tra xem userId và _id có tồn tại trong request không
        if (!userId || !_id) {
            return res.status(400).json({ message: 'userId và _id là bắt buộc' });
        }

        try {
            // Tìm kiếm danh sách yêu thích của người dùng
            const like = await Like.findOne({ userId });

            if (!like) {
                return res.status(404).json({ message: 'Không tìm thấy danh sách yêu thích của người dùng' });
            }

            // Xóa sản phẩm khỏi danh sách yêu thích
            like.productList = like.productList.filter(id => id.toString() !== _id);
            await like.save();

            res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi danh sách yêu thích' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích' });
        }
    },

    // Kiểm tra sản phẩm có trong danh sách yêu thích của người dùng không
    checkLike: async (req, res) => {
        const { userId, _id } = req.body;

        // Kiểm tra xem userId và _id có tồn tại trong request không
        if (!userId || !_id) {
            return res.status(400).json({ message: 'userId và _id là bắt buộc' });
        }

        try {
            // Tìm kiếm danh sách yêu thích của người dùng
            const like = await Like.findOne({ userId });

            if (!like) {
                return res.status(404).json({ message: 'Không tìm thấy danh sách yêu thích của người dùng' });
            }

            // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
            const isFavorited = like.productList.includes(_id);
            res.status(200).json({ isFavorited });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra sản phẩm trong danh sách yêu thích' });
        }
    },

    // Lấy danh sách yêu thích của người dùng
    getLikesByUser: async (req, res) => {
        const { userId } = req.params;

        try {
            // Tìm kiếm danh sách yêu thích của người dùng và populate các sản phẩm trong danh sách
            const like = await Like.findOne({ userId }).populate('productList');

            if (!like) {
                return res.status(404).json({ message: 'Không tìm thấy danh sách yêu thích của người dùng' });
            }

            // Trả về danh sách sản phẩm yêu thích
            res.status(200).json({ productList: like.productList });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách yêu thích của người dùng' });
        }
    }
};

module.exports = likeController;
