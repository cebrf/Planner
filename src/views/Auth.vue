<template>
  <div class="auth-container">
    <b-container>
      <b-row>
        <b-col>
        </b-col>
        <b-col sm="10" lg="8">          
          <div class="auth">
            <div class="title">{{signIn ? 'Sign in to your account' : 'Create a Planner Account'}}</div>
            <div>
              <b-alert
                  :show="dismissCountDown"
                  dismissible
                  variant="warning"
                  @dismissed="dismissCountDown=0"
                  @dismiss-count-down="countDownChanged"
              >
                {{ submissionErrorMsg }}
              </b-alert>
            </div>
            <b-form @submit.prevent="onSubmit" class="auth-form" :novalidate="true" :validated="!signIn && error">
              <b-form-group
                  id="input-group-1"
                  label-for="input-1"
                  v-show="!signIn"
              >
                <b-form-input
                    id="input-1"
                    v-model="form.name"
                    type="text"
                    size="sm"
                    required
                    placeholder="Name"
                    :pattern="namePattern"
                ></b-form-input>
                <b-form-invalid-feedback>
                  Please enter a name.
                </b-form-invalid-feedback>
              </b-form-group>
              <b-form-group
                  id="input-group-2"
                  label-for="input-2"
              >
                <b-form-input
                    id="input-2"
                    v-model="form.email"
                    type="email"
                    size="sm"
                    required
                    :pattern="emailPattern"
                    placeholder="Email"
                ></b-form-input>
                <b-form-invalid-feedback>
                  Please enter a valid Email.
                </b-form-invalid-feedback>
              </b-form-group>
              <b-form-group
                  id="input-group-3"
                  label-for="input-3"
              >
                <b-form-input
                    id="input-3"
                    v-model="form.password"
                    type="password"
                    size="sm"
                    required
                    placeholder="Password"
                    :pattern="passwordPattern"
                ></b-form-input>
                <b-form-invalid-feedback>
                  Password must be 8 character long with at least one letter, one number and one special
                  character:.
                </b-form-invalid-feedback>
              </b-form-group>
              <b-button type="submit" class="submit-btn" variant="success" size="sm"
                        :disabled="this.$store.state.submitting">
                <div v-if="!this.$store.state.submitting">
                  {{signIn ? 'LogIn' : 'SignUp'}}
                </div>
                <circle2 v-else class="form-loader"/></b-button>
              <b-button class="google-signIn-btn" variant="outline-primary" size="sm" @click="googleOAuth">
                <font-awesome-icon :icon="google" size="lg"/>
                {{signIn ? 'Log in' : 'Sign up'}} with Google
              </b-button>
            </b-form>
            <div class="change-auth-type">
              <div v-if="signIn">
                Create an Account? <strong @click.prevent="changeAuthType(false)">SignUp</strong>
              </div>
              <div v-else>
                Already have an Account? <strong @click.prevent="changeAuthType(true)" class="logIn">LogIn</strong>
              </div>
            </div>
          </div>
        </b-col>
        <b-col>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import {BForm, BFormGroup, BFormInput, BButton, BFormInvalidFeedback, BAlert, BContainer, BRow, BCol} from 'bootstrap-vue'
  import {faGoogle} from '@fortawesome/free-brands-svg-icons'
  import { Circle2 } from 'vue-loading-spinner'

  export default {
    name: "Auth",
    components: {
      BForm,
      BButton,
      BFormInput,
      BFormGroup,
      BFormInvalidFeedback,
      BAlert,
      BContainer,
      BRow,
      BCol,
      Circle2
    },
    data() {
      return {
        signIn: false,
        error: false,
        dismissSecs: 5,
        dismissCountDown: 0,
        submissionErrorMsg: '',
        emailPattern: '[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?',
        namePattern: '[A-Za-z ]{3,}',
        passwordPattern: '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$',
        form: {
          email: '',
          password: '',
          name: ''
        }
      }
    },
    computed: {
      google () {
        return faGoogle
      }
    },
    methods: {
      onSubmit() {
        this.error = true
        let name = this.form.name
        let email = this.form.email
        let password = this.form.password
        let emailRegx = new RegExp(this.emailPattern);
        let nameRegx = new RegExp(this.namePattern)
        let passwordRegx = new RegExp(this.passwordPattern)
        if (nameRegx.test(name)
          && emailRegx.test(email)
          && passwordRegx.test(password)) {
          if(!this.signIn) {
            this.$store.dispatch('emailSignUp', {name, email, password})
              .then(() => this.$router.push('/'))
              .catch(err => {
                this.dismissCountDown = this.dismissSecs;
                this.submissionErrorMsg = err;
              })
          }
        }else{
          if(this.signIn){
            this.$store.dispatch('emailSignIn', {email, password})
              .then(() => this.$router.push('/'))
              .catch(err => {
                this.dismissCountDown = this.dismissSecs;
                this.submissionErrorMsg = err;
              })
          }
        }
      },
      countDownChanged(dismissCountDown) {
        this.dismissCountDown = dismissCountDown
      },
      changeAuthType(isSignIn) {
        Object.assign(this.$data, this.$options.data());

        this.signIn = isSignIn;
      },
      googleOAuth() {
        this.$store.dispatch('googleOAuth')
          .then(() => this.$router.push('/'))
          .catch(err => {
            this.dismissCountDown = this.dismissSecs;
            this.submissionErrorMsg = err;
          })
      }
    }
  }
</script>

<style scoped>
  .auth-container{
    text-align: center;
    margin-top: 6%;
  }

  .auth{
    border-radius: 3%;
    padding: 2.5rem 1.5rem;
    display: inline-block;
    background: rgb(255, 255, 255);
    min-width: 10rem;
    opacity: 0.92;
    flex-direction: column;
    align-items: center;
    margin: 1.0rem;
  }

  .title{
    font-size: 24px;
    margin-bottom: 2rem;
    margin: 1rem 2rem;
  }

  .auth-form{
    display: flex;
    flex-direction: column;
    width: 90%;
    max-width: 100%;
    margin: auto;
  }

  .google-signIn-btn{
    margin-top: 1rem;
  }

  .change-auth-type{
    padding-top: 2rem;
    color: gray;
    display: flex;
    margin: auto;
    margin: 0rem 1rem;
  }

  .change-auth-type div strong{
    color: rgb(26,130,83);
    cursor: pointer;
  }

  @media screen and (max-width: 640px) {
    .auth {
      padding: 2rem 0;
    }
  }

  @media screen and (max-device-width: 912px) and (orientation: landscape){
    .auth {
      padding: 2rem 0;
    }
  }

  .submit-btn{
    display: flex;
    justify-content: center;
  }

  .form-control-sm{
    margin-bottom: 1rem;
  }

  .form-loader{
    height: 24px !important;
    width: 24px !important;
  }

</style>