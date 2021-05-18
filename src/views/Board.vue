<template>
  <div>
    <div class="board-title pl-3 h3 text-dark mb-0"
      @mouseover="showBoardEditBtn = true"
      @mouseleave="showBoardEditBtn = false">
      {{$store.state.board.name}}
      <span class="edit-icon action-icon" v-show="showBoardEditBtn">
        <font-awesome-icon @click="editBoardName" :icon="edit" size="xs"/>
      </span>
      <span class="delete-icon action-icon" v-show="showBoardEditBtn">
        <font-awesome-icon @click="deleteBoard" :icon="del" size="xs"/>
      </span>
    </div>
    <Container @drop="onDrop" orientation="horizontal" class="boards">
      <Draggable v-for="list in orderedList" :key="list.id">
        <List :id="list.id" :title="list.title" :cards="list.cards"/>
      </Draggable>
      <AddListButton/>
    </Container>
  </div>
</template>

<script>
  import {faPenAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
  import List from '../components/ui/List'
  import AddListButton from "../components/ui/AddListButton";
  import { Container, Draggable } from "vue-smooth-dnd";

  export default {
    name: "Board",
    created(){
      this.$store.dispatch('fetchLists', this.$route.params.id)
      this.$store.dispatch('currentBoard', this.$route.params.id)
    },
    beforeDestroy(){
      this.$store.state.boardListener()
      this.$store.state.listListener()
    },
    components: {
      List,
      AddListButton,
      Container,
      Draggable
    },
    computed: {
      orderedList: {
        get() {
          return this.$store.getters.orderedList;
        }
      },
      edit() {
        return faPenAlt
      },
      del() {
        return faTrashAlt
      }
    },
    data() {
      return {
        showBoardEditBtn: false
      }
    },
    methods: {
      editBoardName() {
        
      },
      deleteBoard() {

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
    margin-left: 1.0rem;
    padding: 1.0rem;
    display: inline-block;
  }

  .boards{
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    align-items: flex-start;
    padding: 0.5rem 2rem 1rem 2rem;
    height: calc(100vh - 4rem - 33px);
  }

  .action-icon{
    padding-left: 1.0rem;
  }
</style>