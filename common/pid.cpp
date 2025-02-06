#include "pid.h"
#include <algorithm>
#include <mxbackend.h>

PidController::PidController(double min, double max, double kp, double kd, double ki) :
	_min(min), _max(max),
	_kp(kp), _kd(kd), _ki(ki),
	_dt(0.0), _tgt(0.0), _bias(0.0),
	_int(0.0), _diff(0.0),
	_err(0.0), _lerr(0.0),
	_ltime(mulex::SysGetCurrentTime())
{
}

void PidController::setTarget(double target)
{
	_tgt = std::clamp(target, _min, _max);
}

void PidController::setBias(double bias)
{
	_bias = bias;
}

double PidController::calculateDt()
{
	std::int64_t now = mulex::SysGetCurrentTime();
	double dt = (now - _ltime) / 1000.0;
	_ltime = now;
	return dt;
}

double PidController::correct(double value, double dt)
{
	if(dt > 0.0)
	{
		// Custom dt
		_dt = dt;
	}
	else
	{
		// Calculate dt
		_dt = calculateDt();
	}

	_err = _tgt - value;
	double p = _kp * _err;
	double i = _ki * (_int += (_err * _dt));
	double d = _kd * ((_err - _lerr) / _dt);
	_lerr = _err;

	std::cout << p << " " << _kp << " " << _err << std::endl;

	return std::clamp(p + i + d + _bias, _min, _max);
}

double PidController::getError(double value)
{
	return _tgt - value;
}

