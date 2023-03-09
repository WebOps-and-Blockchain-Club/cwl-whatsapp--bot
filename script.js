const foo = (a) => {
  let b = 0
  console.log('Starting', a)
  switch (a) {
    case 0:
      console.log(0)
      b = 5
      return 199
    case 1:
      console.log(1)
      b = 6
      return 1999
    default:
      console.log('default')
      b = 7
  }
  console.log(b)
  console.log('Ending')
}

console.log(foo(0))
console.log(foo(1))
console.log(foo(2))
