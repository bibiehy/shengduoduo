/*
用法1，title 居中，设置 placement="center"
<navigation-bar title="请选择登录角色" placement="center" showBack="{{true}}" color="#000" background="#fff"></navigation-bar>

用法2，title 局左，设置 placement="left"
<navigation-bar title="请选择登录角色" placement="left" showBack="{{true}}" color="#000" background="#fff"></navigation-bar>

用法3，不显示返回按钮， title 部分自定义，placement 设置为空，showBack="{{false}}"
<navigation-bar showBack="{{false}}" background="#fff">
    <view class="test-barbox">自定义 title</view>
</navigation-bar>

背景透明：transparent，向下拉动导航从透明变的可见，使用
onPageScroll(e) { 
    const navigationBackgroundColor = getScrollColor(e.scrollTop, '#1677ff');
    if(navigationBackgroundColor) {
        this.setData({ navigationBackgroundColor });
    }
}
*/

Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        extClass: { type: String, value: '' },
        title: { type: String, value: '' },
        background: { type: String, value: 'transparent' },
		color: { type: String, value: 'rgba(0, 0, 0, 0.9)' },
		boxShadow: { type: String, value: '5px 0 10px #e2e1e1' },
		showBack: { type: Boolean, value: true },
		showEmpty: { type: Boolean, value: true },
		placement: { type: String, value: '' }, // 空为插槽，left 为 title 局左，center 为 title 居中
        // loading: { type: Boolean, value: false },
		delta: { type: Number, value: 1 }, // back为true的时候，返回的页面深度
		opacity: { type: Number, value: 1 }, // 不透明度
    },
    data: {
        
    },
    lifetimes: {
        attached() {
            const rect = wx.getMenuButtonBoundingClientRect();
            wx.getSystemInfo({
                success: (res) => {
                    const isAndroid = res.platform === 'android';
                    const isDevtools = res.platform === 'devtools';
                    this.setData({
                        ios: !isAndroid,
                        innerPaddingRight: `padding-right: ${res.windowWidth - rect.left}px`,
                        leftWidth: `${res.windowWidth - rect.left }px`,
                        safeAreaTop: isDevtools || isAndroid ? `height: calc(var(--height) + ${res.safeArea.top}px); padding-top: ${res.safeArea.top}px` : ``
                    });
                }
            });
        }
    },
    methods: {
        onBack() {
            const data = this.data;
            if(data.delta) {
                wx.navigateBack({ delta: data.delta });
            }

            this.triggerEvent('back', { delta: data.delta }, {});
        }
    }
})
