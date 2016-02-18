const makeInputClearDriver = (selectors) => {
  return (clear$) => {
    clear$.subscribe(() => {
        const nodes = document.querySelectorAll(selectors.join(' '));
        // noprotect
        for(let i = 0; i < nodes.length; i++){
          nodes[i].value = '';
        }
      });
    return clear$.map(() => '');
    };
};

module.exports = {makeInputClearDriver};