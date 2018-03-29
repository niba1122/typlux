# Typlux

Typlux is a TypeScript friendly implementation of Flux architecture which is writtern in TypeScript.

<img src="https://user-images.githubusercontent.com/9022756/38075754-6f2082a8-336e-11e8-81ea-8e9a03e3f0d3.png" width="50%">


## Install

* npm

```
$ npm install typlux
```

* yarn

```
$ yarn add typlux
```

## Usage

### Declare flux elements

#### Action

```ExampleAction.ts
export default interface ExampleActionType { }
export class StartSomeAction implements ExampleActionType { constructor(public hoge: string) { } }
```

#### State

```ExampleState.ts
export interface ExampleState {
  hoge: string,
  fuga: string
}
```

#### ViewProperty

```ExampleViewProperty.ts
export interface ExampleState {
  foo: string,
  bar: string
}
```

#### ActionCreator

```ExampleActionCreator.ts
export class ExampleActionCreator extends ActionCreator<ExampleActionType, ExampleState> {
  constructor(
    protected dispatch: (action: ExampleActionType) => void,
    protected state: ImmutableVariable<ExampleState>) {
    super()
  }

  someAction(hoge: string) {
    this.dispatch(new StartSomeAction(hoge))
  }
}
```

#### Reducer

```ExampleReducer.ts
const exampleReducer: (action: ExampleActionType, state: ExampleState) => ExampleState =
  (action: ExampleActionType, state: ExampleState) => {
    if (action instanceof StartSomeAction) {
      return {
        ...state,
        hoge: action.value
      }
    } else if (...) {
      .
      .
      .
    }
    return state
  }

export default exampleReducer
```

#### Getter

```ExampleGetter.ts
const exampleGetter: (state: ExampleState) => ExampleViewProperty = (state: ExampleState) => {
  return {
    foo: state.hoge,
    bar: state.fuga
  }
}

export default exampleGetter
```


#### Store

```ExampleGetter.ts
export default class ExampleStore extends Store<ExampleActionCreator, ExampleActionType, ExampleState, ExampleViewProperty> {
  protected provideActionCreator(dispatch: (action: ExampleActionType) => void, state: ImmutableVariable<ExampleState>): ExampleActionCreator {
    return new ExampleActionCreator(dispatch, state, this.exampleRepository)
  }
  protected provideReducer(): (action: ExampleActionType, state: ExampleState) => ExampleState {
    return exampleReducer
  }
  protected provideGetter(): (state: ExampleState) => ExampleViewProperty {
    return exampleGetter
  }
  protected provideInitialState(): ExampleState {
    return {
      hoge: "foo",
      fuga: "bar"
    }
  }
}
```

### Connect store and component


#### Store for specific component

TBD

#### Store for whole application

TBD

Please see [example](https://github.com/niba1122/typlux-example)

## Example

[Simple Todo Application](https://github.com/niba1122/typlux-example)

## Development

```
$ npm install
$ npm run dev
$ npm run build
```
