<div>
  <span><slot /></span>
</div>

<style lang="scss">
  div {
    width: max-content;
    display: flex;
    align-items: center;
    max-width: 40ch;
  }
  span {
    display: block;
    text-align: center;
    border-radius: 5px;
    padding: 5px;
    font-size: 0.9em;

    color: var(--ddm-200);
  }
  span:hover {
    color: var(--ddm-100);
  }
  span:active {
    color: var(--ddm-50);
  }
</style>
