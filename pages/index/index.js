var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'RAMBZ-UKXW6-FZOSO-M6ENO-RCTTE-THFBQ'
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 获取的经纬度
    t_lat: '32.00335',
    t_lng: '118.73145',
    // 地图的markers
    markers: [],
    // 当前选中第几个
    xmwzB_index: 0,
    // tab列表
    tabs: [{
        ico: '../../images/around/icon1.png',
        ico_active: '../../images/around/icon1_1.png',
        name: '交通'
      },
      {
        ico: '../../images/around/icon2.png',
        ico_active: '../../images/around/icon2_1.png',
        name: '学校'
      },
      {
        ico: '../../images/around/icon3.png',
        ico_active: '../../images/around/icon3_1.png',
        name: '医疗'
      },
      {
        ico: '../../images/around/icon4.png',
        ico_active: '../../images/around/icon4_1.png',
        name: '购物'
      },
      {
        ico: '../../images/around/icon5.png',
        ico_active: '../../images/around/icon5_1.png',
        name: '餐饮'
      },
    ],
    // 把从腾讯地图SDK获取的位置存起来，以后每次点击就不用请求了。
    arrlist: [
      [],
      [],
      [],
      [],
      []
    ],
    // 记录当前地图选中的icon点
    location: ['', '', '', '', ''],
    // 是否展示地图跳转导航按钮
    navigation: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var marks = [];
    // 地图上的icon图标
    marks.push({ // 获取返回结果，放到mks数组中
      latitude: that.data.t_lat,
      longitude: that.data.t_lng,
      iconPath: '../../images/around/address.png', //图标路径
      width: 20,
      height: 20,
    });
    // 地图上的气泡点
    that.setData({
      markers: marks
    });

    // 进页面先请求一波(第一个tab下对应的列表内容)
    that.nearby_search(that.data.tabs[0].name);

  },
  // 点击tab切换
  xmwzB_click(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    that.setData({
      xmwzB_index: index
    }, () => {
      var name = that.data.tabs[index].name;
      that.nearby_search(name);
    });
  },
  // 通过关键字调用地图SDK，搜索获取结果列表
  nearby_search(key) {
    var that = this;
    var xmwzB_index = that.data.xmwzB_index;
    var list_c = that.data.arrlist[xmwzB_index];
    // 判断是否请求过了，如果没请求过则请求；请求过了就直接赋值
    if (list_c && list_c.length) {
      that.setData({
        markers: list_c
      });
    } else {
      wx.showToast({
        title: '请稍后',
        icon: 'loading',
        duration: 2000
      })
      qqmapsdk.search({
        keyword: key, // 搜索关键词
        page_size: 5, // 一页展示几个
        location: that.data.t_lat + ',' + that.data.t_lng, //设置周边搜索中心点
        success: function (res) { //搜索成功后的回调
          wx.hideToast({});

          var marks = [];
          marks.push({ // 获取返回结果，放到mks数组中
            latitude: that.data.latitude,
            longitude: that.data.longitude,
            iconPath: '../../images/around/address.png', //图标路径
            width: 20,
            height: 20,
          });

          for (var i = 0; i < res.data.length; i++) {
            marks.push({ // 获取返回结果，放到mks数组中
              title: res.data[i].title,
              id: res.data[i].id,
              latitude: res.data[i].location.lat,
              longitude: res.data[i].location.lng,
              iconPath: '../../images/around/cover_1.png', //图标路径
              width: 20,
              height: 20,
              address: res.data[i].address,
              callout: {
                content: res.data[i].title,
                color: '#404040',
                bgColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#8a8a8a',
                fontSize: 14,
                padding: 10,
                borderRadius: 10,
                display: 'ALWAYS'
              }
            });
          }
          // 只赋值当前tab下的内容，其他tab下的不用管
          var arrlist_key = 'arrlist[' + xmwzB_index + ']';
          that.setData({ //设置markers属性，将搜索结果显示在地图中
            [arrlist_key]: marks,
            markers: marks
          });
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          //console.log(res.data);
        }
      });
    }
  },
  // 地图上的气泡点击事件绑定，具体详情可参考微信小程序地图api
  callouttap(e) {
    var that = this;
    var marks = that.data.markers;

    // 点击某个tab下的某个气泡，其他气泡恢复为初始状态，点击的气泡变为选中状态
    // 同时把选中的状态的气泡信息存入到location对应位置(给点击跳转导航做准备)
    for (var i = 0; i < marks.length; i++) {
      if (marks[i].callout == undefined) {
        continue
      }
      marks[i].callout.bgColor = '#ffffff';
      marks[i].callout.color = '#404040'
      marks[i].callout.borderColor = '#8a8a8a'
    }

    that.setData({
      markers: marks,
      navigation: true,
      ['markers[' + that.data.markers.findIndex((n) => n.id == e.markerId) + '].callout.bgColor']: '#558ef9',
      ['markers[' + that.data.markers.findIndex((n) => n.id == e.markerId) + '].callout.color']: '#ffffff',
      ['markers[' + that.data.markers.findIndex((n) => n.id == e.markerId) + '].callout.borderColor']: '#558ef9',
      ['location[' + that.data.xmwzB_index + ']']: that.data.markers[that.data.markers.findIndex((n) => n.id == e.markerId)]
    });

  },
  // 小程序地图api，跳转大地图
  show_big_map: function () {
    var that = this;
    var location_c = that.data.location[that.data.xmwzB_index];
    var lat_c = location_c.latitude ? location_c.latitude : '';
    var lng_c = location_c.longitude ? location_c.longitude : '';
    var name_c = location_c.title ? location_c.title : '';
    var address_c = location_c.address ? location_c.address : '';

    if (location_c && lat_c && lng_c && name_c && address_c) {
      wx.getLocation({ //获取当前经纬度
        type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息  
        success: function (res) {
          wx.openLocation({ //​使用微信内置地图查看位置。
            latitude: lat_c, //要去的纬度-地址
            longitude: lng_c, //要去的经度-地址
            name: name_c,
            address: address_c
          });
        }
      })
    }
  }

})