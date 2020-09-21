StructureFactory.prototype.goalAmount = function(backOneLevel?: boolean) : number
{
  let factoryGoalAmount = 1000;
  if(this.level)
  {
    const testLevel = (backOneLevel) ? this.level - 1 : this.level;
    switch (testLevel)
    {
      case 1:
        factoryGoalAmount = 1000;
        break;
      case 2:
        factoryGoalAmount = 160;
        break;
      case 3:
        factoryGoalAmount = 80;
        break;
      case 4:
        factoryGoalAmount = 40;
        break;
      case 5:
        factoryGoalAmount = 60;
        break;
    }
  }

  return factoryGoalAmount;
}
