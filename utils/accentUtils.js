export const vowelAccents = {
  in: 'ÀÁÂÃÄÅĄĀāàáâãäåąÒÓÔÕÕÖØŐòóôőõöøÈÉÊËĘèéêëęðÌÍÎÏĪìíîïīÙÚÛÜŰùűúûüŸÝÿý',
  out: 'AAAAAAAAaaaaaaaaOOOOOOOOoooooooEEEEEeeeeeeIIIIIiiiiiUUUUUuuuuuYYyy',
}

export const consonantAccents = {
  in: 'ßĎďDŽdžÇçČčĆćÐĽĹŁľĺłÑŇŃňñńŔŕŠŚŞšśşŤťŽŻŹžżźđĢĞģğ',
  out: 'sDdDZdzCcCcCcDLLLlllNNNnnnRrSSSsssTtZZZzzzdGGgg',
}

export const mapLetters = (string, map) =>
  string
    .split('')
    .map((letter, index) => {
      const accentIndex = map.in.indexOf(letter)
      return accentIndex !== -1 ? map.out[accentIndex] : letter
    })
    .join('')

export const removeVowelAccents = (string) => mapLetters(string, vowelAccents)

export const removeConsonantAccents = (string) =>
  mapLetters(string, consonantAccents)

export const removeAccents = (string) =>
  removeVowelAccents(removeConsonantAccents(string))
