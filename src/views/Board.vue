<template>
  <div>
    <modal id="show-users" v-cloak>
      <template slot="title">Board users</template>
      <div slot="body">
        <div v-for="(user, index) in boardUsers" :key="user.id">
          {{ index }}: {{ user.name }}
          <b-button
              class="removeUser"
              variant="success"
              size="sm"
              v-show="showRemoveUserBtn(user.id)"
              @click="removeUser(user.id)"
          >Remove</b-button>
        </div>
      </div>
    </modal>
    <div class="err" v-show="!(showBoard)">
      This board does't exist or is unavailable
    </div>
    <div class="contentBoards" v-show="showBoard">
      <b-container fluid class="board-title pl-3 h3 text-dark mb-0"
        @mouseover="showBoardEditBtn = true"
        @mouseleave="showBoardEditBtn = false">
          <b-row>
            <b-col sm="4">
              {{ (typeof(this.$store.state.board) !== 'undefined') ? this.$store.state.board.name : "Doard is deleted" }}
              <span class="edit-icon action-icon" v-show="showBoardEditBtn">
                <font-awesome-icon @click="editBoardName" :icon="edit" size="xs"/>
              </span>
              <span class="delete-icon action-icon" v-show="showBoardDeleteBtn">
                <font-awesome-icon @click="deleteBoard" :icon="del" size="xs"/>
              </span>
            </b-col>
            <b-col sm="6">
              <b-form-input
                  v-model="user_email"
                  type="email"
                  size="sm"
                  required
                  placeholder="Email"
              ></b-form-input>
            </b-col>
            <b-col>
              <b-button
                  class="sendEmail"
                  variant="success"
                  size="sm"
                  @click="sendEmail"
              >Send invite</b-button>
            </b-col>
          </b-row>
          <b-row style="margin-top: 0.5rem">
            <b-col lg="8" md="6" sm="2">
            </b-col>
            <b-col>
              <b-button
                  class="leaveBtn"
                  variant="success"
                  size="sm"
                  v-show="showLeaveBoardBtn"
                  @click="leaveBoard"
              >Leave board</b-button>
            </b-col>
            <b-col>
              <b-button
                  class="showUsers"
                  variant="success"
                  size="sm"
                  @click="showUsers"
              >Show board users</b-button>
            </b-col>
          </b-row>
        </b-container>

      <div 
        @mouseover="showBoardEditBtn = true"
        @mouseleave="showBoardEditBtn = false">

      </div>
      <Container @drop="onDrop" orientation="horizontal" class="boards" v-if="(typeof(this.$store.state.board) !== 'undefined')">
        <Draggable v-for="list in orderedList" :key="list.id">
          <List :id="list.id" :title="list.title" :cards="list.cards"/>
        </Draggable>
        <AddListButton/>
      </Container>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import {faPenAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
  import List from '../components/ui/List'
  import AddListButton from "../components/ui/AddListButton";
  import { Container, Draggable } from "vue-smooth-dnd";
  import { Modal, VoerroModal } from '@voerro/vue-modal';
  import { BButton, BFormInput, BContainer, BRow, BCol } from 'bootstrap-vue'

  Vue.component('modal', Modal);
  window.VoerroModal = VoerroModal;

  export default {
    name: "Board",
    created(){
      this.$store.dispatch('checkIsAuthenticated')
      this.$store.dispatch('checkInvited', this.$route.params.id)
      this.$store.dispatch('fetchBoards') // this need to check if user have permission to use board
      this.$store.dispatch('fetchLists', this.$route.params.id)
      this.$store.dispatch('currentBoard', this.$route.params.id)
    },
    beforeDestroy(){
      this.$store.state.boardListener()
      this.$store.state.listListener()
    },
    components: {
      BButton,
      BFormInput,
      BContainer,
      BRow,
      BCol,
      List,
      AddListButton,
      Container,
      Draggable
    },
    computed: {
      orderedList: {
        get() {
          if (typeof(this.$store.state.board) !== 'undefined')
            return this.$store.getters.orderedList;
          else {
            console.log("board is deleted");
            return null;
          }
        }
      },
      boardUsers: {
        get() {
          if (typeof(this.$store.state.board) !== 'undefined') {
            let users = this.$store.getters.boardUsers(this.$route.params.id);

            return users;
          } else {
            console.log("boardUsers: board is deleted");
            return null;
          }
        }
      },
      edit() {
        return faPenAlt
      },
      del() {
        return faTrashAlt
      },
      showLeaveBoardBtn: {
        get() {
          return !(this.$store.getters.isBoardCreator(this.$route.params.id))
        }
      },
      showBoard: {
        get() {
          return this.$store.getters.isAlailableTo(this.$route.params.id)
        }
      },
      showBoardDeleteBtn: {
        get() {
          return (this.$store.getters.isBoardCreator(this.$route.params.id))
        }
      }
    },
    data() {
      return {
        showBoardEditBtn: false,
        user_email: ''
      }
    },
    methods: {
      sendEmail: function () {
        if ("=========", this.user_email === '') {
          return;
        }

        this.$store.dispatch('inviteUserInBoard', {
          email: this.user_email,
          boardId: this.$route.params.id
        });

        this.$store.dispatch('sendInvite', {
          email: this.user_email,
          boardId: this.$route.params.id
        });
      },
      showRemoveUserBtn(userId) {
        let isBoardCreator = this.$store.getters.isBoardCreator(this.$route.params.id);
        let isCurUser = (userId == this.$store.state.uid);

        return (isBoardCreator && (!isCurUser));
      },
      leaveBoard: function () {
        if(confirm("Do you really want to leave this board?")){
          this.$store.dispatch('leaveBoard', this.$route.params.id);

          this.$router.push('/');
        }
      },
      editBoardName() {
        // TODO
      },
      removeUser(userId) {
        this.$store.dispatch('removeUser',
        {
          userId: userId,
          boardId: this.$route.params.id
        });

        console.log("user removed: ", userId, "...", this.$route.params.id);
      },
      showUsers() {
        console.log("Hello!");
        VoerroModal.show('show-users');
      },
      deleteBoard() {
        if(confirm("Do you really want to delete?")){
          console.log("Deleted", this.$route.params.id);

          this.$store.dispatch('deleteBoard', {
            boardId: this.$route.params.id
          });

          this.$router.push('/');
        } else {
          console.log("NOT deleted", this.$route.params.id);
        }
      },
      onDrop (dropResult) {
        const { removedIndex, addedIndex } = dropResult;

        if(removedIndex !== addedIndex){
          let originalArray = this.$store.state.board.lists;

          const movedItem = originalArray.find((item, index) => index === removedIndex);
          const remainingItems = originalArray.filter((item, index) => index !== removedIndex);

          const reorderedItems = [
            ...remainingItems.slice(0, addedIndex),
            movedItem,
            ...remainingItems.slice(addedIndex)
          ];

          this.$store.dispatch('updateBoard',{ boardId: this.$route.params.id, newLists: reorderedItems});
        }
      }
    }
  }
</script>

<style scoped>
  .board-title{
    padding: 1.0rem;
    display: inline-block;
    font-size: 1.4rem;
  }

  .err {
    text-align: center;
    margin-top: 4rem;
  }

  .leaveBtn{
    text-align: right;
  }

  .boards{
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    align-items: flex-start;
    padding: 0.5rem 2rem 1rem 2rem;
    height: calc(100vh - 14rem);
  }

  .smooth-dnd-container.horizontal > .smooth-dnd-draggable-wrapper{
    height: auto;
  }

  .action-icon{
    margin-left: 1.0rem;
  }

  .action-icon:hover {
    background: rgba(211, 215, 217, 0.7);
    cursor: pointer;
  }

  .sendEmail{
    margin-left: 1rem;
  }

  .leaveBtn{
    margin-left: 1rem;
  }

  .showUsers{
    margin-left: 1rem;
  }

  .removeUser{
    margin-left: 2rem;
  }
</style>