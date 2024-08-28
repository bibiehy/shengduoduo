// components/fixed-bottom-button/fixed-bottom-button.js
Component({
	properties: {
		title: { type: String, value: '' },
		theme: { type: String, value: 'primary' },
		size: { type: String, value: 'large' },
		loading: { type: Boolean, value: false },
	},
	data: {

	},
	methods: {
		onSure() {
            this.triggerEvent('callback', {});
        }
	}
})