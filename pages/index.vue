<template lang="pug">
  v-row(justify="center" align="stretch")
    v-col(cols="12" sm="8")
      v-card.pb-4
        v-card-title
          v-row.ma-0
            .display-1 Sigilator Magickando
            .ml-2.mt-1.title.font-weight-thin (POC)
        v-row.ma-0(wrap)
          v-col.pa-0(cols="12" md="7")
            v-card-text.pb-0 Use o campo de texto para inserir um ou mais objetos a serem sigilados, e escolha os parâmetros de transformação do texto.
            v-card-text.pt-0.paramsForm
              v-form
                v-row
                  v-col(cols="12")
                    v-textarea(
                      label="Entradas"
                      hint="Insira um sigilo por linha"
                      max-width="600px"
                      v-model="input"
                    )
                v-subheader Configurações
                v-row(wrap dense)
                  v-col(cols="12" md="6")
                    v-text-field(
                      dense
                      label="Seed de aleatoriedade"
                      hint="Esse valor é usado para alimentar os algoritmos de pseudo-aleatoriedade"
                      v-model="settings.randomSeed"
                    )
                  v-col(cols="12" md="6")
                    v-switch(
                      dense
                      label="Exibir passo a passo das transformações"
                      v-model="settings.showSteps"
                    )
                v-subheader Transformações
                v-row(dense)
                  v-col(cols="12" md="6")
                    v-select(label="Transliterar" :items="availableTransliterations" v-model="settings.transliterate" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(label="Remover vogais" v-model="settings.removeVowels" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(label="Remover consoantes" v-model="settings.removeConsonants" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(label="Remover acentuação" v-model="settings.removeAccents" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(label="Remover letras repetidas" v-model="settings.removeRepeated" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(label="Remover espaços" v-model="settings.removeSpaces" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(label="Embaralhar letras" v-model="settings.randomizeLetters" hide-details dense)
                v-row(dense)
                  v-col(cols="12")
                    v-switch(
                      dense
                      :disabled="settings.showSteps"
                      :error-messages="settings.showSteps ? ['Não disponível quando a exibição de passos está ativa'] : undefined"
                      label="Embaralhar linhas"
                      v-model="settings.randomizeResults"
                    )
          v-col.pa-0(cols="12" md="5")
            v-row.ma-0.fill-height.flex-nowrap(align="stretch")
              v-divider.hidden-sm-and-down(vertical)
              v-col.pa-0
                v-divider.hidden-md-and-up
                v-card-title {{ result.length > 1 ? 'Resultados' : 'Resultado' }}
                v-card-text
                  //- pre(align="left") {{ result }}
                  ul
                    transition-group
                      template(v-for="(line, i) in result")
                        v-divider.mt-1(v-if="i > 0" :key="'a' + i")
                        template(v-for="(step, stepIndex) in line.steps")
                          li(:key="`${line.id} + ${stepIndex}`")
                            div(
                              :class="stepIndex === line.steps.length - 1 ? 'title' : ''"
                              :key="stepIndex"
                            )
                              transition-group
                                .letter(v-for="({ letter, id } in indexedLetters(step)" :key="id") {{ letter }}
                                  span(v-if="letter === ' '") &nbsp;
</template>

<script>
import RandomSeed from 'random-seed'
import Cyrilic from 'cyrillic-to-translit-js'

import {
  removeAccents,
  removeVowelAccents,
  removeConsonantAccents,
} from '~/utils/accentUtils'

export default {
  data: () => ({
    input: `quero pão\nquero manteiga\nquero receber mais propostas de freelance para aumentar a minha renda e comprar um celular novo`,
    settings: {
      transliterate: false,
      randomSeed: 'magickando',
      showSteps: false,
      randomizeResults: true,
      randomizeLetters: false,
      removeVowels: false,
      removeConsonants: false,
      removeRepeated: false,
      removeSpaces: false,
      removeAccents: false,
    },
    transliterationHandlers: {
      cyrillicRu(input) {
        const cyrillic = Cyrilic({ preset: 'ru' })
        return cyrillic.reverse(input)
      },
      cyrillicUk(input) {
        const cyrillic = Cyrilic({ preset: 'uk' })
        return cyrillic.reverse(input)
      },
    },
    availableTransliterations: [
      { text: 'Selecionar alfabeto', value: false },
      { text: 'Alfabeto Cyrilico - Russo', value: 'cyrillicRu' },
      { text: 'Alfabeto Cyrilico - Ucraniano', value: 'cyrillicUk' },
    ],
  }),
  computed: {
    randomSeed() {
      return this.settings.randomSeed + this.input
    },
    transformations() {
      const transformations = [
        'removeVowels',
        'removeConsonants',
        'removeAccents',
        'removeRepeated',
        'removeSpaces',
        'randomizeLetters',
        'transliterate',
      ]
      return transformations
        .filter((key) => this.settings[key])
        .map((key) => this[key].bind(this))
    },
    result() {
      const { input, settings } = this
      const inputs = input
        .split('\n')
        .filter((v) => v !== '')
        .map((line) => this.transform(line))
        .map((steps, id) => ({ steps, id: `i-${id}` }))
      if (settings.showSteps) return inputs
      const lastSteps = inputs.map((steps) => this.getSteps(steps))
      return settings.randomizeResults
        ? this.randomizeResults(lastSteps)
        : [lastSteps]
    },
  },
  watch: {
    'settings.removeConsonants': {
      handler(value) {
        if (!value) return
        this.settings.removeVowels = false
      },
    },
    'settings.removeVowels': {
      handler(value) {
        if (!value) return
        this.settings.removeConsonants = false
      },
    },
  },
  methods: {
    indexedLetters(line) {
      const letters = line.split('')
      const letterIndexes = letters.reduce(
        (acc, letter, index) => ({
          ...acc,
          [letter]: [...(acc[letter] || []), index],
        }),
        {}
      )
      return letters.map((letter, index) => ({
        letter,
        id: `${letter}-${letterIndexes[letter].indexOf(index)}`,
      }))
    },
    stringify(obj) {
      return JSON.stringify(obj)
    },
    randomGenerator(flavour) {
      return RandomSeed.create(this.randomSeed + flavour)
    },
    randomizeArray(array, seed) {
      const random = this.randomGenerator(seed)
      const result = [...array].sort(() =>
        random.floatBetween(0, 1) > 0.4 ? 1 : -1
      )
      random.done()
      return result
    },
    transform(input) {
      return this.transformations.reduce(
        (acc, cur) => [...acc, cur(acc[acc.length - 1])],
        [input]
      )
    },
    randomizeLetters(input) {
      return this.randomizeArray(input.split(''), 'randomizeLetters' + input)
        .join('')
        .replace(/\s{2,}/g, ' ')
    },
    randomizeResults(inputs) {
      return this.randomizeArray(
        inputs,
        'randomizeResults' + JSON.stringify(inputs)
      )
    },
    removeConsonantAccents(input) {
      return removeConsonantAccents(input)
    },
    removeVowelAccents(input) {
      return removeVowelAccents(input)
    },
    removeAccents(input) {
      return removeAccents(input)
    },
    removeVowels(input) {
      return removeVowelAccents(input)
        .replace(/[aeiouy]/gi, '')
        .replace(/\s{2,}/g, ' ')
    },
    removeConsonants(input) {
      return removeConsonantAccents(input)
        .replace(/([bcdfghjklmnpqrstvxzw])/gi, '')
        .replace(/\s{2,}/g, ' ')
    },
    removeSpaces(input) {
      return input.replace(/\s/g, '')
    },
    removeRepeated(input) {
      return input
        .split('')
        .filter(
          (letter, index, self) =>
            self.indexOf(letter) === index || letter === ' '
        )
        .join('')
        .replace(/\s{2,}/g, ' ')
    },
    getSteps(line) {
      const { steps } = line
      return {
        ...line,
        steps: this.settings.showSteps ? steps : [steps[steps.length - 1]],
      }
    },
    transliterate(input) {
      const preset = this.settings.transliterate
      return this.transliterationHandlers[preset](input)
    },
  },
}
</script>

<style lang="sass" scoped>
.fill-height
  height: 100%
.letter
  display: inline-block
ul *
  transition: transform .4s
//- .paramsForm::v-deep
  .row, .row > div
    margin: 0 !important
    padding: 0 !important
</style>
