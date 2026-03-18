export const translations = {
  zh: {
    common: {
      searchPlaceholder: '搜尋地點...',
      findMe: '我的位置',
      loading: '載入中...',
      all: '全部',
      close: '關閉',
      submit: '提交',
      addLocation: '新增地點',
      cancel: '取消',
      filterStroller: '嬰兒車友善',
    },
    locationForm: {
      nameZh: '中文名稱',
      nameEn: '英文名稱',
      category: '分類',
      addressZh: '中文地址',
      addressEn: '英文地址',
      descriptionZh: '中文描述',
      descriptionEn: '英文描述',
      facilities: '設施 (可多選)',
      coordinates: '座標',
    },
    categories: {
      park: '公園',
      nursing_room: '哺乳室',
      restaurant: '餐廳',
      medical: '醫療設施',
    },
    facilities: {
      changing_table: '尿布台',
      high_chair: '兒童餐椅',
      stroller_accessible: '無障礙/嬰兒車可',
      public_toilet: '公共廁所',
    },
    locationDetail: {
      address: '地址',
      rating: '評分',
      facilities: '設施',
    },
    reviews: {
      title: '評論',
      write: '撰寫評論',
      rating: '評分',
      comment: '評論內容',
      userName: '您的名稱',
      empty: '暫無評論',
    }
  },
  en: {
    common: {
      searchPlaceholder: 'Search locations...',
      findMe: 'Find Me',
      loading: 'Loading...',
      all: 'All',
      close: 'Close',
      submit: 'Submit',
      addLocation: 'Add Location',
      cancel: 'Cancel',
      filterStroller: 'Stroller Friendly',
    },
    locationForm: {
      nameZh: 'Name (Chinese)',
      nameEn: 'Name (English)',
      category: 'Category',
      addressZh: 'Address (Chinese)',
      addressEn: 'Address (English)',
      descriptionZh: 'Description (Chinese)',
      descriptionEn: 'Description (English)',
      facilities: 'Facilities',
      coordinates: 'Coordinates',
    },
    categories: {
      park: 'Park',
      nursing_room: 'Nursing Room',
      restaurant: 'Restaurant',
      medical: 'Medical Facility',
    },
    facilities: {
      changing_table: 'Changing Table',
      high_chair: 'High Chair',
      stroller_accessible: 'Stroller Accessible',
      public_toilet: 'Public Toilet',
    },
    locationDetail: {
      address: 'Address',
      rating: 'Rating',
      facilities: 'Facilities',
    },
    reviews: {
      title: 'Reviews',
      write: 'Write a Review',
      rating: 'Rating',
      comment: 'Comment',
      userName: 'Your Name',
      empty: 'No reviews yet',
    }
  }
};

export type TranslationKeys = typeof translations.en;
