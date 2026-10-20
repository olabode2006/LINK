const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export async function geocodePostalCode(postalCode) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postalCode)}.json?country=CA&access_token=${MAPBOX_TOKEN}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.features && data.features.length > 0) {
    const [lng, lat] = data.features[0].center
    return { lat, lng }
  }

  return null
}