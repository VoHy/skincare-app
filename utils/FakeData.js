const calculateFinalPrice = (price, discount) => price * (1 - discount / 100);

const FakeData = [
    {
        id: "1",
        name: "Serum Dưỡng Ẩm",
        brand: "The Ordinary",
        images: [
            require("../assets/image/skincare1.png"),
            require("../assets/image/skincare1.png")
        ],
        ingredients: ["Niacinamide", "Hyaluronic Acid", "Zinc PCA"],
        skin_types: ["Oily", "Combination"],
        discount: 10,
        unit: "ml",
        price: 299000,
        countInStock: 20,
        description: "Serum cấp ẩm sâu, giúp da luôn mịn màng và tươi trẻ.",
        category: "Serum",
        finalPrice: calculateFinalPrice(299000, 10)
    },
    {
        id: "2",
        name: "Kem Chống Nắng SPF 50",
        brand: "La Roche-Posay",
        images: [
            require("../assets/image/skincare2.png"),
            require("../assets/image/skincare2.png")
        ],
        ingredients: ["Titanium Dioxide", "Zinc Oxide", "Vitamin E"],
        skin_types: ["All"],
        discount: 5,
        unit: "ml",
        price: 399000,
        countInStock: 15,
        description: "Bảo vệ da khỏi tia UV, giúp da không bị sạm nám.",
        category: "Kem Chống Nắng",
        finalPrice: calculateFinalPrice(399000, 5)
    },
    {
        id: "3",
        name: "Toner Cấp Ẩm",
        brand: "Hada Labo",
        images: [
            require("../assets/image/skincare6.png"),
            require("../assets/image/skincare6.png")
        ],
        ingredients: ["Hyaluronic Acid", "Glycerin", "Panthenol"],
        skin_types: ["Dry", "Sensitive"],
        discount: 0,
        unit: "ml",
        price: 199000,
        countInStock: 10,
        description: "Toner dưỡng ẩm sâu, cân bằng độ pH và làm dịu da.",
        category: "Toner",
        finalPrice: calculateFinalPrice(199000, 0)
    },
    {
        id: "4",
        name: "Sữa Rửa Mặt Dịu Nhẹ",
        brand: "CeraVe",
        images: [
            require("../assets/image/skincare4.png"),
            require("../assets/image/skincare4.png")
        ],
        ingredients: ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
        skin_types: ["All"],
        discount: 10,
        unit: "ml",
        price: 159000,
        countInStock: 25,
        description: "Sữa rửa mặt nhẹ nhàng, làm sạch sâu mà không gây khô da.",
        category: "Sữa Rửa Mặt",
        finalPrice: calculateFinalPrice(159000, 10)
    },
    {
        id: "5",
        name: "Mặt Nạ Đất Sét",
        brand: "Innisfree",
        images: [
            require("../assets/image/skincare5.png"),
            require("../assets/image/skincare5.png")
        ],
        ingredients: ["Kaolin", "Bentonite", "Green Tea Extract"],
        skin_types: ["Oily", "Combination"],
        discount: 0,
        unit: "ml",
        price: 259000,
        countInStock: 18,
        description: "Thải độc và làm sạch sâu, giúp da sáng mịn hơn.",
        category: "Mặt Nạ",
        finalPrice: calculateFinalPrice(259000, 0)
    },
    {
        id: "6",
        name: "Kem Dưỡng Ban Đêm",
        brand: "Laneige",
        images: [
            require("../assets/image/skincare3.png"),
            require("../assets/image/skincare3.png")
        ],
        ingredients: ["Water Sleeping Complex", "Beta-Glucan", "Hyaluronic Acid"],
        skin_types: ["All"],
        discount: 0,
        unit: "ml",
        price: 349500,
        countInStock: 12,
        description: "Dưỡng ẩm và phục hồi da khi ngủ, giúp da căng mọng.",
        category: "Kem Dưỡng",
        finalPrice: calculateFinalPrice(349500, 0)
    },
    {
        id: "7",
        name: "Serum Dưỡng Ẩm",
        brand: "The Ordinary",
        images: [
            require("../assets/image/skincare7.png"),
            require("../assets/image/skincare7.png")
        ],
        ingredients: ["Niacinamide", "Hyaluronic Acid", "Zinc PCA"],
        skin_types: ["Oily", "Combination"],
        discount: 10,
        unit: "ml",
        price: 699000,
        countInStock: 20,
        description: "Serum cấp ẩm sâu, giúp da luôn mịn màng và tươi trẻ.",
        category: "Serum",
        finalPrice: calculateFinalPrice(299000, 10)
    },
    {
        id: "8",
        name: "Tinh Chất Vitamin C",
        brand: "Some By Mi",
        images: [
            require("../assets/image/skincare8.png"),
            require("../assets/image/skincare8.png")
        ],
        ingredients: ["Vitamin C", "Niacinamide", "Centella Asiatica"],
        skin_types: ["All"],
        discount: 15,
        unit: "ml",
        price: 450000,
        countInStock: 30,
        description: "Làm sáng da, mờ thâm và cải thiện đều màu da.",
        category: "Serum",
        finalPrice: calculateFinalPrice(450000, 15)
    },
    {
        id: "9",
        name: "Gel Rửa Mặt Ngừa Mụn",
        brand: "Paula's Choice",
        images: [
            require("../assets/image/skincare9.png"),
            require("../assets/image/skincare9.png")
        ],
        ingredients: ["Salicylic Acid", "Green Tea Extract", "Aloe Vera"],
        skin_types: ["Oily", "Combination"],
        discount: 5,
        unit: "ml",
        price: 320000,
        countInStock: 22,
        description: "Làm sạch sâu, ngăn ngừa mụn và kiểm soát dầu thừa.",
        category: "Sữa Rửa Mặt",
        finalPrice: calculateFinalPrice(320000, 5)
    },
    {
        id: "10",
        name: "Kem Dưỡng Ẩm Da Khô",
        brand: "Neutrogena",
        images: [
            require("../assets/image/skincare10.png"),
            require("../assets/image/skincare10.png")
        ],
        ingredients: ["Hyaluronic Acid", "Glycerin", "Vitamin E"],
        skin_types: ["Dry"],
        discount: 10,
        unit: "ml",
        price: 290000,
        countInStock: 16,
        description: "Dưỡng ẩm sâu, giúp da mềm mại và căng bóng.",
        category: "Kem Dưỡng",
        finalPrice: calculateFinalPrice(290000, 10)
    },
    {
        id: "11",
        name: "Mặt Nạ Dưỡng Trắng",
        brand: "Mediheal",
        images: [
            require("../assets/image/skincare11.png"),
            require("../assets/image/skincare11.png")
        ],
        ingredients: ["Niacinamide", "Pearl Extract", "Hyaluronic Acid"],
        skin_types: ["All"],
        discount: 0,
        unit: "ml",
        price: 59000,
        countInStock: 50,
        description: "Mặt nạ giúp làm sáng da, cấp ẩm và thư giãn.",
        category: "Mặt Nạ",
        finalPrice: calculateFinalPrice(59000, 0)
    },
    {
        id: "12",
        name: "Kem Chống Nắng Dưỡng Ẩm",
        brand: "Eucerin",
        images: [
            require("../assets/image/skincare12.png"),
            require("../assets/image/skincare12.png")
        ],
        ingredients: ["SPF 50+", "Hyaluronic Acid", "Vitamin E"],
        skin_types: ["Sensitive", "Dry"],
        discount: 10,
        unit: "ml",
        price: 420000,
        countInStock: 18,
        description: "Bảo vệ da khỏi tia UV, dưỡng ẩm và chống lão hóa.",
        category: "Kem Chống Nắng",
        finalPrice: calculateFinalPrice(420000, 10)
    }
];

export default FakeData;
