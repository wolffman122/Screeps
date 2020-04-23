interface RoomVisual
{
  structure(x,y,opts);
  connectRoads(opts);
  speech(text, x, y, opts);
  animatedPosition(x, y);
  test();
  resource(type, x, y, size);
  _fluid(type, x,y, size);
  _mineral(type, x,y, size);
  _compound(type, x,y, size);
}
