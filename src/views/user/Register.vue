<template>
  <div class="main user-layout-register">
    <!-- <h3><span>注册</span></h3> -->
    <a-form ref="formRegister" :form="form" id="formRegister">
      <a-form-item>
        <a-input
            size="large"
            type="text"
            placeholder="用户名"
            maxlength="100"
            v-decorator="[
            'username',
            {rules: [{ required: true, message: '请输入用户名' }], validateTrigger: ['change', 'blur']}
        ]"/>
      </a-form-item>

      <a-popover placement="rightTop" trigger="click" :visible="state.passwordLevelChecked">
        <template slot="content">
          <div :style="{ width: '240px' }" >
            <div :class="['user-register', passwordLevelClass]">强度：<span>{{ passwordLevelName }}</span></div>
            <a-progress :percent="state.percent" :showInfo="false" :strokeColor=" passwordLevelColor " />
            <div style="margin-top: 10px;">
              <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input
            size="large"
            type="password"
            maxlength="100"
            @click="handlePasswordInputClick"
            @focus="focusAnimate"
            @blur="blurAnimate"
            autocomplete="false"
            placeholder="至少6位密码，区分大小写"
            v-decorator="[
                'password',
                {rules: [{ required: true, message: '至少6位密码，区分大小写'}, { validator: this.handlePasswordLevel }], validateTrigger: ['change', 'blur']}
            ]"/>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input
            size="large"
            type="password"
            autocomplete="false"
            maxlength="100"
            placeholder="确认密码"
            @focus="focusAnimate"
            @blur="blurAnimate"
            v-decorator="[
                'password2',
                {rules: [{ required: true, message: '至少6位密码，区分大小写' }, { validator: this.handlePasswordCheck }], validateTrigger: ['change', 'blur']}
            ]"/>
      </a-form-item>

      <a-form-item>
        <a-input
            size="large"
            placeholder="11 位手机号"
            maxlength="11"
            v-decorator="[
                'mobile',
                {rules: [{ required: true, message: '请输入正确的手机号', pattern: /^1[3456789]\d{9}$/ }], validateTrigger: ['change', 'blur'] }
            ]">
          <a-select slot="addonBefore" size="large" defaultValue="+86">
            <a-select-option value="+86">+86</a-select-option>
            <a-select-option value="+87">+87</a-select-option>
          </a-select>
        </a-input>
      </a-form-item>

      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item>
            <a-input
                size="large"
                type="text"
                placeholder="验证码"
                maxlength="4"
                v-decorator="[
                    'captcha',
                    {rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur'}
                ]">
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }"/>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
            <img :src="captchaUrl" alt="captcha" class="getCaptcha" @click="getCaptcha">
        </a-col>
      </a-row>

      <a-form-item>
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn">注册
        </a-button>
        <router-link class="login" :to="{ name: 'login' }">使用已有账户登录</router-link>
      </a-form-item>

    </a-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

const levelNames: string[] = ['低', '低', '中', '强'];

const levelClass: string[] = ['error', 'error', 'warning', 'success'];

const levelColor: string[] = ['#ff0000', '#ff0000', '#ff7e05', '#52c41a'];

@Component
export default class Register extends Vue {
  private captchaUrl: string = `${this.$ctx}/user/verify?t=${new Date().getTime()}`

  private registerBtn: boolean = false

  public data() {
    return {
      form: this.$form.createForm(this),
      state: {
        time: 60,
        smsSendBtn: false,
        passwordLevel: 0,
        passwordLevelChecked: false,
        percent: 10,
        progressColor: '#FF0000',
      },
    };
  }

  @Watch('state.passwordLevel')
  private passwordLevel(val: number) {
    // console.log(val)
  }

  private get passwordLevelClass() {
    return levelClass[this.state.passwordLevel];
  }

  private get passwordLevelName() {
    return levelNames[this.state.passwordLevel];
  }

  private get passwordLevelColor() {
    return levelColor[this.state.passwordLevel];
  }

  private handlePasswordLevel(rule: any, value: any, callback: any) {
    let level = 0;

    // 判断这个字符串中有没有数字
    if (/[0-9]/.test(value)) {
      level++;
    }
    // 判断字符串中有没有字母
    if (/[a-zA-Z]/.test(value)) {
      level++;
    }
    // 判断字符串中有没有特殊符号
    if (/[^0-9a-zA-Z_]/.test(value)) {
      level++;
    }
    this.state.passwordLevel = level;
    this.state.percent = level * 30;
    if (level >= 2) {
      if (level >= 3) {
        this.state.percent = 100;
      }
      callback();
    } else {
      if (level === 0) {
        this.state.percent = 10;
      }
      callback(new Error('密码强度不够'));
    }
  }

  private handlePasswordCheck(rule: any, value: any, callback: any) {
    const password = this.form.getFieldValue('password');
    if (value === undefined) {
      callback(new Error('请输入密码'));
    }
    if (value && password && value.trim() !== password.trim()) {
      callback(new Error('两次密码不一致'));
    }
    callback();
  }

  private handlePasswordInputClick() {
    this.state.passwordLevelChecked = true;
  }

  private handleSubmit() {
    this.form.validateFields((err: any, values: any) => {
      if (!err) {
        this.createUser(values);
      } else {
        this.$notification.warn({
          message: '注册失败',
          description: '请稍后重新尝试',
        });
      }
    });
  }

  //  注册请求
  private async createUser(params: any) {
    const res: Ajax.AjaxResponse = await this.$http.post(`${this.$ctx}/user/register`, params);
    if (res.status === 200) {
      this.$notification.success({
        message: '提示',
        description: res.resultMsg || '注册成功',
      });
      this.$router.push({ name: 'result' });
    } else {
      this.getCaptcha();
      this.$notification.warn({
        message: '提示',
        description: res.resultMsg || '注册失败',
      });
    }
  }

  //  获取验证码
  private getCaptcha() {
    this.captchaUrl = `${this.$base + this.$ctx}/user/verify?t=${new Date().getTime()}`;
  }

  private requestFailed(err: any) {
    this.$notification.error({
      message: '错误',
      description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
      duration: 4,
    });
    this.registerBtn = false;
  }

  //  点击密码输入框聚焦事件
  private focusAnimate() {
    this.$store.commit('SET_COVER', true);
  }

  private blurAnimate() {
    this.$store.commit('SET_COVER', false);
  }
}
</script>
<style lang="scss">
  .user-register {

    &.error {
      color: #ff0000;
    }

    &.warning {
      color: #ff7e05;
    }

    &.success {
      color: #52c41a;
    }

  }

  .user-layout-register {
    padding: 42px 20px 20px;
    background: rgba(255, 255, 255, .2);
    .ant-input-group-addon:first-child {
      background-color: #fff;
    }
  }
</style>
<style lang="scss" scoped>
  .user-layout-register {

    & > h3 {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .getCaptcha {
      display: block;
      width: 100%;
      height: 40px;
      border: 1px solid #d9d9d9;
      background: #fff;
      cursor: pointer;
    }

    .register-button {
      width: 50%;
    }

    .login {
      float: right;
      line-height: 40px;
    }
  }
</style>
